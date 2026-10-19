# System Design Document: TicketHub & Course Reflection

## 1. Requirements

### Functional Requirements
* **Browse & Search Events:** Users can search and filter upcoming concerts, sports, and live events by venue, date, artist, or genre.
* **View Seat Map & Availability:** Users can view real-time seat maps with seat statuses (Available, Held, Sold).
* **Hold Seats (Temporary Reservation):** Users can temporarily hold up to 4 selected seats for a strict 10-minute timeout window while completing checkout.
* **Payment & Order Processing:** Users can process payments for held seats and convert them into confirmed tickets.
* **Ticket Management:** Users can view their purchased tickets, complete with unique QR codes for venue entry.

### Non-Functional Requirements
* **Correctness (Zero Double-Booking):** Under no circumstances should two users be able to purchase or reserve the exact same seat for an event (**Strong Consistency**).
* **Fairness:** Seats during high-demand sales must be allocated strictly on a first-come, first-served basis without race conditions or starvation.
* **High Availability & Scalability:** The system must handle extreme traffic spikes (hot-ticket drops) without total downtime or degraded performance for passive browsing.
* **Low Latency:** Seat selection and holding should respond within $<200\text{ ms}$; general event browsing pages should load within $<100\text{ ms}$.

---

## 2. Traffic & Capacity Estimations

### Given Parameters
* **Registered Users:** $2,000,000$
* **Normal Day:** 
  * $50,000$ daily active users (DAU)
  * $10$ page views per user
  * $5,000$ tickets sold per day
* **Big Sale Peak:** 
  * $200,000$ users concurrent within a 10-minute window ($600\text{ seconds}$)
  * $20,000$ available seats

---

### Normal Traffic Estimates
* **Page Views:** 
  $$\text{Total Daily Views} = 50,000 \times 10 = 500,000\text{ requests/day}$$
* **Average Read QPS (Query Per Second):** 
  $$\text{Read QPS} = \frac{500,000}{86,400\text{ seconds}} \approx 5.8\text{ QPS}$$
* **Average Write QPS (Ticket Sales):** 
  $$\text{Write QPS} = \frac{5,000}{86,400\text{ seconds}} \approx 0.058\text{ QPS}$$

---

### "Big Sale" Peak Traffic Estimates
* **Peak User Arrival Rate:**
  $$200,000\text{ users in } 10\text{ minutes } (600\text{ seconds}) \approx 333\text{ new users/second}$$
* **Peak Request Volume:** Assuming each user refreshes, browses, and attempts to hold seats ($15\text{ requests/user}$ on average during the rush):
  $$\text{Total Requests} = 200,000 \times 15 = 3,000,000\text{ requests}$$
  $$\text{Peak Read/Write QPS} = \frac{3,000,000}{600\text{ seconds}} = 5,000\text{ QPS}$$
* **Peak Checkout/Hold Attempt QPS:** Assuming $200,000$ users attempt to lock a seat near simultaneously within a 2-minute peak window ($120\text{ seconds}$):
  $$\text{Peak Hold QPS} = \frac{200,000}{120} \approx 1,667\text{ QPS}$$

---

### Comparison Summary
| Metric | Normal Day Traffic | Big Sale Traffic | Multiplication Factor |
| :--- | :--- | :--- | :--- |
| **Active Users** | 50,000 / day | 200,000 / 10 mins | ~$4\times$ total volume in $\frac{1}{144}\text{th}$ of time |
| **Total QPS** | ~6 QPS | 5,000 QPS | **~833x Surge** |
| **Seat Locking Write QPS** | ~0.06 QPS | 1,667 QPS | **~27,700x Surge** |

---

## 3. API Design

### 1. `GET /api/v1/events`
* **Description:** Browse and search active events.
* **Query Parameters:** `q`, `category`, `page`, `limit`
* **Response (200 OK):**
```json
{
  "events": [
    {
      "event_id": "evt_987",
      "title": "Live in Concert",
      "venue": "National Stadium",
      "event_date": "2026-12-01T20:00:00Z",
      "min_price": 50.00
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1 }
}

{
  "event_id": "evt_987",
  "seats": [
    { "seat_id": "s_101", "section": "A", "row": "1", "number": "12", "status": "AVAILABLE", "price": 150.00 },
    { "seat_id": "s_102", "section": "A", "row": "1", "number": "13", "status": "HELD", "price": 150.00 }
  ]
}

{
  "seat_ids": ["s_101"]
}

{
  "hold_id": "h_5501",
  "seat_ids": ["s_101"],
  "expires_at": "2026-10-19T10:39:00Z",
  "status": "HELD"
}

{
  "hold_id": "h_5501",
  "payment_token": "tok_visa_1234"
}

{
  "order_id": "ord_8820",
  "status": "CONFIRMED",
  "total_amount": 150.00,
  "ticket_ids": ["t_001"]
}

{
  "tickets": [
    {
      "ticket_id": "t_001",
      "event_title": "Live in Concert",
      "seat": "Sec A, Row 1, Seat 12",
      "qr_code_url": "[https://cdn.tickethub.com/qr/t_001.png](https://cdn.tickethub.com/qr/t_001.png)"
    }
  ]
}




BEGIN;

-- 1. Lock the specific row for update. Other concurrent transactions attempting
-- to select this row FOR UPDATE will block until this transaction finishes.
SELECT seat_id, status 
FROM seats 
WHERE seat_id = 's_101' 
FOR UPDATE;

-- 2. Verify availability inside the transaction block
-- If status != 'AVAILABLE', rollback immediately.

-- 3. Update status to 'HELD'
UPDATE seats 
SET status = 'HELD', version = version + 1 
WHERE seat_id = 's_101' AND status = 'AVAILABLE';

-- 4. Create hold record
INSERT INTO holds (hold_id, seat_id, user_id, expires_at)
VALUES ('h_5501', 's_101', 'usr_123', NOW() + INTERVAL '10 minutes');

COMMIT;



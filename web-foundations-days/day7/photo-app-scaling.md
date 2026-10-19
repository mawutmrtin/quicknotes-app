# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

The following assumptions are used to estimate the capacity required for SnapShare:

- Total registered users: 10,000,000.
- Daily active users (DAU): 10% of registered users.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Each photo has one thumbnail of 50 KB.
- There are 365 days in a year.
- A day contains 86,400 seconds.
- Peak traffic is estimated to be 5 times the average traffic.
- All daily active users upload one photo each day, and each upload produces one thumbnail.
- Storage estimates assume that photos and thumbnails are retained for one year, with no deletion or compression beyond the stated sizes.
- The estimates exclude database overhead, backups, replication, logs, and other application data.

## 2. Capacity Calculations

### 2.1 Daily Active Users

Daily active users are calculated as 10% of the total registered users.

DAU = 10,000,000 × 10%

DAU = 1,000,000 users per day.

Therefore, SnapShare has **1 million daily active users**.

### 2.2 Photo Uploads Per Second

Each daily active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

Daily uploads = 1,000,000 photos.

Average uploads per second = 1,000,000 ÷ 86,400

Average uploads per second ≈ 11.57 photos per second.

Peak uploads per second = 11.57 × 5

Peak uploads per second ≈ 57.87 photos per second.

Therefore, SnapShare should plan for approximately **12 average uploads per second and 58 peak uploads per second**.

### 2.3 Feed Views Per Second

Each daily active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000 feed views.

Average feed views per second = 50,000,000 ÷ 86,400

Average feed views per second ≈ 578.70 feed views per second.

Peak feed views per second = 578.70 × 5

Peak feed views per second ≈ 2,893.52 feed views per second.

Therefore, SnapShare should plan for approximately **579 average feed views per second and 2,894 peak feed views per second**.

These figures represent feed-page requests, not the total number of individual photos delivered. A feed page may contain several photos, and each photo may require a separate image request unless caching and delivery optimizations reduce those requests.

### 2.4 Photo Storage Per Year

Each original photo occupies 2 MB, and its thumbnail occupies 50 KB.

For this estimate, 1 MB = 1,000 KB.

Original photo storage per day:

1,000,000 × 2 MB = 2,000,000 MB = 2,000 GB = 2 TB.

Thumbnail storage per day:

1,000,000 × 50 KB = 50,000,000 KB = 50 GB.

Total photo and thumbnail storage per day:

2 TB + 50 GB = 2.05 TB.

Annual original photo storage:

2 TB × 365 = 730 TB.

Annual thumbnail storage:

50 GB × 365 = 18,250 GB = 18.25 TB.

Total annual storage:

730 TB + 18.25 TB = 748.25 TB.

Therefore, SnapShare needs approximately **730 TB per year for original photos and 18.25 TB per year for thumbnails, totaling 748.25 TB per year** using decimal storage units.

This estimate assumes that all uploaded photos and thumbnails are retained for one year. Additional capacity will be needed for backups, redundancy, and future growth.

## 3. Is SnapShare Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view 50 feed pages per day but upload only one photo per day.

Daily feed views = 50,000,000.

Daily photo uploads = 1,000,000.

The ratio of feed views to photo uploads is 50:1.

This means feed-reading requests occur approximately 50 times as often as photo uploads. The architecture should therefore prioritize fast feed delivery, caching, database read replicas, and a CDN to reduce the workload on application servers and the primary database.

Photo uploads still require reliable processing and durable storage, but the largest request volume comes from users browsing their feeds.

## 4. Why Photos Should Not Be Stored Inside the Database

Photos should not be stored directly as large binary files inside the main relational database because doing so increases database size, backup and recovery time, storage costs, and pressure on database resources.

Instead, SnapShare should store original photos and thumbnails in **object storage**, such as Amazon S3, Azure Blob Storage, or Google Cloud Storage. Object storage is designed to hold large files reliably and can scale independently of the application database.

The database should store metadata such as the photo ID, owner ID, caption, upload time, object-storage key or URL, thumbnail key, and visibility settings. This allows the database to handle structured information efficiently while a CDN delivers images to users.

## 5. SnapShare Architecture Diagram

                         USERS
                           |
           
              |                          |
              v                          v
                
             CDN                 CDN      
        Cached feed             Photo files 
        images                  and thumbs  
                  
              |                           ^
              | Cache miss / API            Fetch image
              v                           
                    |
         Load Balancer                   
                     
                                          
                       
        |                |                 
        v                v                 
          
   App Server     App Server        
   Instance 1     Instance 2          
        
        |                |                
                   
        |                  |               
        v                  v               
      
   Redis Cache     Primary DB        
   Feed/cache      Users, metadata    
 
                             |             
                             | Replication 
                             v             
                       
                     Read Replica       
                     Feed queries      
                      
                                           
  PHOTO UPLOAD PATH                         
                        
                                           
  User -> Load Balancer -> App Server       
                               |             
                               v             
                           
                        Object Storage
                        Original photo
                      
                               |
                               | Queue thumbnail job
                               v
                   
                        Message Queue 
                    
                               |
                               v
                       
                        Thumbnail     
                        Worker        
                       
                               |
                               | Save thumbnail
                               v
                       
                        Object Storage
                        Thumbnail     
                      


The diagram shows the main components and the thumbnail-processing path. The CDN serves cached images, while API requests pass through the load balancer to the application servers.

## 6. What Each Component Does

1. **CDN (Content Delivery Network):** Delivers cached photos and thumbnails from locations close to users, reducing latency, bandwidth costs, and requests reaching the origin servers.
2. **Load Balancer:** Distributes incoming application requests across multiple app server instances to prevent one server from becoming overloaded.
3. **App Servers:** Handle authentication, photo uploads, feed generation, permissions, metadata updates, and communication with the cache, database, object storage, and queue.
4. **Redis Cache:** Stores frequently accessed feed data and other commonly requested information in memory to reduce database queries and improve response times.
5. **Primary Database:** Stores structured data such as users, photo metadata, captions, relationships between followers, and references to stored photo files.
6. **Database Read Replica:** Handles eligible read queries, such as feed and photo-metadata lookups, to reduce read pressure on the primary database.
7. **Object Storage:** Stores the original photo files and generated thumbnails durably and independently of the relational database.
8. **Message Queue:** Holds thumbnail-generation jobs so that photo uploads do not have to wait for image processing to finish.
9. **Thumbnail Worker:** Retrieves queued jobs, creates smaller versions of uploaded photos, and saves the resulting thumbnails to object storage.

## 7. Step-by-Step Photo Upload Flow

1. **User selects a photo:** The user chooses a photo and submits it through the SnapShare application.

2. **Request reaches the load balancer:** The load balancer forwards the upload request to a healthy application server.

3. **Authentication and validation:** The application server checks the user's identity, upload permissions, file type, file size, and other security requirements.
4. **Store the original photo:** The application uploads the original image to object storage under a unique object key.

5. **Save photo metadata:** The application writes the photo ID, owner ID, caption, upload time, object key, and processing status to the primary database.
6. **Queue a thumbnail job:** The application publishes a message containing the photo ID and object-storage key to the message queue.

7. **Confirm the upload:** Once the original file and required metadata have been saved and the job has been safely queued, the application returns a successful response to the user. The thumbnail can be generated asynchronously.

8. **Worker processes the job:** A thumbnail worker retrieves the message and downloads or reads the original image from object storage.

9. **Generate the thumbnail:** The worker resizes the image and encodes a thumbnail targeting approximately 50 KB, depending on image content and compression.

10. **Store the thumbnail:** The worker saves the thumbnail in object storage using a separate key and updates the photo metadata to indicate that thumbnail processing is complete.

11. **Deliver the photo:** When users view the feed, the application returns photo metadata and image references; the CDN delivers the original photo or thumbnail as appropriate.

12. **Handle failures safely:** If thumbnail processing fails, the job can be retried, and failed jobs can be moved to a dead-letter queue for investigation without losing the original photo.

## 8. Trade-Offs

### Trade-Off 1: Caching Versus Data Freshness

Caching feed data in Redis improves performance and reduces database load, but cached information may become outdated when a user uploads a photo or changes their follow relationships. SnapShare must invalidate or update affected cache entries when relevant data changes, balancing speed with freshness.

### Trade-Off 2: Read Replicas Versus Consistency

Read replicas increase read capacity and help protect the primary database from heavy feed traffic. However, replication can introduce a delay before new data appears on a replica, meaning a user may not immediately see a newly uploaded photo in every read path. SnapShare can use the primary database for critical read-after-write operations and replicas for other reads.

### Trade-Off 3: Asynchronous Thumbnails Versus Immediate Availability

Using a queue and background worker makes uploads faster because the user does not need to wait for thumbnail generation. However, the thumbnail may not be available immediately after upload. The application should show a processing state or temporarily use the original image until the thumbnail is ready.

### Trade-Off 4: Object Storage and CDN Versus Cost and Complexity

Object storage and a CDN provide scalable file storage and fast global delivery, but they introduce additional infrastructure, configuration, and service costs. SnapShare must manage access permissions, cache invalidation, storage retention, and monitoring to keep the system secure and cost-effective.

## 9. Conclusion

SnapShare has 1 million daily active users, approximately 11.57 average photo uploads per second, 578.70 average feed views per second, and an estimated 748.25 TB of new photo and thumbnail storage per year.

Because feed reads occur 50 times as often as uploads, SnapShare is read-heavy. A scalable design uses a CDN for image delivery, a load balancer and multiple app servers for application traffic, Redis for caching, a primary database with a read replica for structured data, object storage for image files, and a message queue with thumbnail workers for asynchronous image processing.

This architecture separates file storage from structured data, reduces database load, improves feed performance, and allows the system to scale as the number of users and photos grows.
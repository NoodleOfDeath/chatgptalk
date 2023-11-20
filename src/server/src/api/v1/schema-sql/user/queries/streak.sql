SELECT 
  "userId", 
  DATE("createdAt") AS date
FROM requests q
WHERE
  "userId" = :userId
  AND (:before IS null OR "createdAt" <= :before)
GROUP BY 
  "userId", 
  date 
ORDER BY
  "userId" desc, 
  date desc
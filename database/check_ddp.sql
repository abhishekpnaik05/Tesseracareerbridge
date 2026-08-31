SELECT d.id, d.title, d.status, d."dayId", day.title as dayTitle, day.index as dayIndex 
FROM "Ddp" d 
JOIN "Day" day ON d."dayId" = day.id 
WHERE d.status = 'PUBLISHED'
ORDER BY day.index, d.id;

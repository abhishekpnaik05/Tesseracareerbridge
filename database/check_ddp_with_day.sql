SELECT d.id, d.title, d.status, d."dayId", d."programId", day.title as dayTitle, day.index as dayIndex 
FROM "Ddp" d 
LEFT JOIN "Day" day ON d."dayId" = day.id 
WHERE d.status = 'PUBLISHED'
ORDER BY day.index, d.id;

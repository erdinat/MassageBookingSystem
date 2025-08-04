-- Manuel olarak Altyngul'u Therapist rolüne geçir
UPDATE Users SET Role = 1 WHERE Email = 'altyngul@therapist.lor-masaj.com';

-- Admin hesabını da Admin rolüne geçir  
UPDATE Users SET Role = 2 WHERE Email = 'admin@lor-masaj.com';

-- Therapist profilini user ile bağla
UPDATE Therapists SET UserId = 4 WHERE Name = 'Altyngul Bolatbek';
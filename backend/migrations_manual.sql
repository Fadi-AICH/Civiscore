-- Fichier de migrations SQL manuelles pour Civiscore
-- À exécuter directement sur la base de données MySQL

-- 1. Mise à jour de la table countries
-- Vérifiez si les colonnes existent avant de les ajouter

-- Ajout de la colonne region si elle n'existe pas
SET @existsRegion = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'countries' AND COLUMN_NAME = 'region');

SET @addRegionSQL = IF(@existsRegion = 0, 
                     'ALTER TABLE countries ADD COLUMN region VARCHAR(100)',
                     'SELECT "Column region already exists"');

PREPARE addRegionStmt FROM @addRegionSQL;
EXECUTE addRegionStmt;
DEALLOCATE PREPARE addRegionStmt;

-- Ajout de la colonne population si elle n'existe pas
SET @existsPopulation = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE TABLE_NAME = 'countries' AND COLUMN_NAME = 'population');

SET @addPopulationSQL = IF(@existsPopulation = 0, 
                        'ALTER TABLE countries ADD COLUMN population FLOAT',
                        'SELECT "Column population already exists"');

PREPARE addPopulationStmt FROM @addPopulationSQL;
EXECUTE addPopulationStmt;
DEALLOCATE PREPARE addPopulationStmt;

-- Vérifiez si l'index sur code existe déjà
SET @existsIndex = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_NAME = 'countries' AND INDEX_NAME = 'idx_countries_code');

SET @createIndexSQL = IF(@existsIndex = 0, 
                      'CREATE INDEX idx_countries_code ON countries(code)',
                      'SELECT "Index idx_countries_code already exists"');

PREPARE createIndexStmt FROM @createIndexSQL;
EXECUTE createIndexStmt;
DEALLOCATE PREPARE createIndexStmt;

-- 2. Mise à jour de la table services
-- Vérifiez si les colonnes existent avant de les ajouter

-- Ajout de la colonne address si elle n'existe pas
SET @existsAddress = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'address');

SET @addAddressSQL = IF(@existsAddress = 0, 
                      'ALTER TABLE services ADD COLUMN address VARCHAR(255)',
                      'SELECT "Column address already exists"');

PREPARE addAddressStmt FROM @addAddressSQL;
EXECUTE addAddressStmt;
DEALLOCATE PREPARE addAddressStmt;

-- Ajout de la colonne website si elle n'existe pas
SET @existsWebsite = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'website');

SET @addWebsiteSQL = IF(@existsWebsite = 0, 
                      'ALTER TABLE services ADD COLUMN website VARCHAR(255)',
                      'SELECT "Column website already exists"');

PREPARE addWebsiteStmt FROM @addWebsiteSQL;
EXECUTE addWebsiteStmt;
DEALLOCATE PREPARE addWebsiteStmt;

-- Ajout de la colonne phone si elle n'existe pas
SET @existsPhone = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'phone');

SET @addPhoneSQL = IF(@existsPhone = 0, 
                    'ALTER TABLE services ADD COLUMN phone VARCHAR(50)',
                    'SELECT "Column phone already exists"');

PREPARE addPhoneStmt FROM @addPhoneSQL;
EXECUTE addPhoneStmt;
DEALLOCATE PREPARE addPhoneStmt;

-- Ajout de la colonne email si elle n'existe pas
SET @existsEmail = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'email');

SET @addEmailSQL = IF(@existsEmail = 0, 
                    'ALTER TABLE services ADD COLUMN email VARCHAR(255)',
                    'SELECT "Column email already exists"');

PREPARE addEmailStmt FROM @addEmailSQL;
EXECUTE addEmailStmt;
DEALLOCATE PREPARE addEmailStmt;

-- Ajout de la colonne opening_hours si elle n'existe pas
SET @existsOpeningHours = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE TABLE_NAME = 'services' AND COLUMN_NAME = 'opening_hours');

SET @addOpeningHoursSQL = IF(@existsOpeningHours = 0, 
                          'ALTER TABLE services ADD COLUMN opening_hours VARCHAR(255)',
                          'SELECT "Column opening_hours already exists"');

PREPARE addOpeningHoursStmt FROM @addOpeningHoursSQL;
EXECUTE addOpeningHoursStmt;
DEALLOCATE PREPARE addOpeningHoursStmt;

-- 3. Mise à jour de la table users (si le champ username n'existe pas déjà)
-- Vérifiez d'abord si la colonne existe avant d'exécuter cette partie
-- ALTER TABLE users
-- ADD COLUMN username VARCHAR(150) NOT NULL DEFAULT 'user',
-- ADD UNIQUE INDEX idx_users_username (username);

-- 4. Mise à jour de la table evaluation_reports pour supporter les nouvelles valeurs d'énumération
-- Cette partie est plus complexe car MySQL ne permet pas de modifier directement une énumération

-- Vérifiez si la table evaluation_reports existe
SET @tableExists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                  WHERE TABLE_NAME = 'evaluation_reports');

SET @modifyReasonSQL = IF(@tableExists > 0, 
                        'ALTER TABLE evaluation_reports MODIFY COLUMN reason VARCHAR(50) NOT NULL',
                        'SELECT "Table evaluation_reports does not exist"');

PREPARE modifyReasonStmt FROM @modifyReasonSQL;
EXECUTE modifyReasonStmt;
DEALLOCATE PREPARE modifyReasonStmt;

-- Mise à jour des valeurs existantes si la table existe
SET @updateReason1SQL = IF(@tableExists > 0, 
                         'UPDATE evaluation_reports SET reason = "inappropriate_content" WHERE reason = "INAPPROPRIATE"',
                         'SELECT "Skipping update for non-existent table"');

PREPARE updateReason1Stmt FROM @updateReason1SQL;
EXECUTE updateReason1Stmt;
DEALLOCATE PREPARE updateReason1Stmt;

SET @updateReason2SQL = IF(@tableExists > 0, 
                         'UPDATE evaluation_reports SET reason = "spam" WHERE reason = "SPAM"',
                         'SELECT "Skipping update for non-existent table"');

PREPARE updateReason2Stmt FROM @updateReason2SQL;
EXECUTE updateReason2Stmt;
DEALLOCATE PREPARE updateReason2Stmt;

SET @updateReason3SQL = IF(@tableExists > 0, 
                         'UPDATE evaluation_reports SET reason = "offensive" WHERE reason = "OFFENSIVE"',
                         'SELECT "Skipping update for non-existent table"');

PREPARE updateReason3Stmt FROM @updateReason3SQL;
EXECUTE updateReason3Stmt;
DEALLOCATE PREPARE updateReason3Stmt;

SET @updateReason4SQL = IF(@tableExists > 0, 
                         'UPDATE evaluation_reports SET reason = "misleading" WHERE reason = "MISLEADING"',
                         'SELECT "Skipping update for non-existent table"');

PREPARE updateReason4Stmt FROM @updateReason4SQL;
EXECUTE updateReason4Stmt;
DEALLOCATE PREPARE updateReason4Stmt;

SET @updateReason5SQL = IF(@tableExists > 0, 
                         'UPDATE evaluation_reports SET reason = "other" WHERE reason = "OTHER"',
                         'SELECT "Skipping update for non-existent table"');

PREPARE updateReason5Stmt FROM @updateReason5SQL;
EXECUTE updateReason5Stmt;
DEALLOCATE PREPARE updateReason5Stmt;

-- Note: Ces migrations sont fournies à titre indicatif
-- Veuillez les adapter en fonction de votre schéma de base de données actuel
-- et testez-les dans un environnement de développement avant de les appliquer en production

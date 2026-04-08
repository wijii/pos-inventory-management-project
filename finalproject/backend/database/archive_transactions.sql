-- ============================================================
-- TRANSACTION ARCHIVING SETUP
-- Database: updatedpos
--
-- How it works:
--   Every night at midnight, MySQL automatically moves any
--   transaction older than 30 days from `transactions` /
--   `transactiondetails` into `transactionarchives` /
--   `transactiondetailsarchives`, then deletes the originals.
--
-- STEP 1: Enable MySQL Event Scheduler (run once)
-- ============================================================

SET GLOBAL event_scheduler = ON;

-- ============================================================
-- STEP 2: Create the stored procedure that does the archiving
-- ============================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS `ArchiveOldTransactions` $$

CREATE PROCEDURE `ArchiveOldTransactions`()
BEGIN

    -- Move transaction header rows older than 30 days
    -- ArchivedBy = 'System (Auto)' since this runs automatically
    INSERT INTO transactionarchives
        (TransactionID, UserID, AmountPaid, TransactionDate, TotalAmountDue, ArchivedDate, ArchivedBy)
    SELECT
        t.TransactionID,
        t.UserID,
        t.AmountPaid,
        t.TransactionDate,
        t.TotalAmountDue,
        NOW(),
        'System (Auto)'
    FROM transactions t
    WHERE t.TransactionDate < DATE_SUB(NOW(), INTERVAL 30 DAY);


    -- Move all matching detail rows into the archive
    -- Links via ArchiveID that was just inserted above
    INSERT INTO transactiondetailsarchives
        (ArchiveID, SKUID, NumberOfItemSold, PricePerUnit, PriceAmount)
    SELECT
        ta.ArchiveID,
        td.SKUID,
        td.NumberOfItemSold,
        td.PricePerUnit,
        td.PriceAmount
    FROM transactiondetails td
    INNER JOIN transactionarchives ta
        ON td.TransactionID = ta.TransactionID
    WHERE ta.ArchivedDate >= DATE_SUB(NOW(), INTERVAL 1 MINUTE);
    -- the 1 minute window ensures we only join rows archived in THIS run


    -- Delete the detail rows first (FK constraint order)
    DELETE td
    FROM transactiondetails td
    INNER JOIN transactionarchives ta
        ON td.TransactionID = ta.TransactionID
    WHERE ta.ArchivedDate >= DATE_SUB(NOW(), INTERVAL 1 MINUTE);


    -- Now delete the transaction headers
    DELETE FROM transactions
    WHERE TransactionDate < DATE_SUB(NOW(), INTERVAL 30 DAY);

END $$

DELIMITER ;


-- ============================================================
-- STEP 3: Create the scheduled MySQL Event
-- Runs every day at midnight automatically
-- ============================================================

DROP EVENT IF EXISTS `evt_archive_old_transactions`;

CREATE EVENT `evt_archive_old_transactions`
    ON SCHEDULE EVERY 1 DAY
    STARTS TIMESTAMP(CURDATE(), '00:00:00')
    DO
        CALL ArchiveOldTransactions();


-- ============================================================
-- STEP 4 (Optional): Run manually right now to archive existing old records
-- Only run this if you want to archive immediately
-- ============================================================

-- CALL ArchiveOldTransactions();

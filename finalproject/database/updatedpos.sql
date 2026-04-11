-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2026 at 05:47 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `updatedpos`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `ArchiveOldTransactions` ()   BEGIN

    -- Move transaction header rows older than 30 days
    -- ArchivedBy = 'System (Auto)' since this runs automatically
    INSERT INTO transactionarchives
        (TransactionID, UserID, AmountPaid, TransactionDate, TotalAmountDue, PaymentMethod, DiscountAmount, ArchivedDate, ArchivedBy)
    SELECT
        t.TransactionID,
        t.UserID,
        t.AmountPaid,
        t.TransactionDate,
        t.TotalAmountDue,
        t.PaymentMethod,
        t.DiscountAmount,
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

END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`CategoryID`, `CategoryName`) VALUES
(1, 'Beverages'),
(2, 'Food');

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `InventoryID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `ReorderLevel` int(11) NOT NULL,
  `LastUpdateTime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `inventories`
--
DELIMITER $$
CREATE TRIGGER `log_inventory_delete` AFTER DELETE ON `inventories` FOR EACH ROW BEGIN
    INSERT INTO InventoryLog (
        InventoryID, SKUID, ActionType,
        QuantityBefore, QuantityAfter,
        ReorderLevelBefore, ReorderLevelAfter,
        ActionTime
    )
    VALUES (
        OLD.InventoryID, OLD.SKUID, 'DELETE',
        OLD.Quantity, NULL,
        OLD.ReorderLevel, NULL,
        NOW()
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_inventory_insert` AFTER INSERT ON `inventories` FOR EACH ROW BEGIN
    INSERT INTO InventoryLog (
        InventoryID, SKUID, ActionType,
        QuantityBefore, QuantityAfter,
        ReorderLevelBefore, ReorderLevelAfter,
        ActionTime
    )
    VALUES (
        NEW.InventoryID, NEW.SKUID, 'INSERT',
        NULL, NEW.Quantity,
        NULL, NEW.ReorderLevel,
        NOW()
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_inventory_update` AFTER UPDATE ON `inventories` FOR EACH ROW BEGIN
    INSERT INTO InventoryLog (
        InventoryID, SKUID, ActionType,
        QuantityBefore, QuantityAfter,
        ReorderLevelBefore, ReorderLevelAfter,
        ActionTime
    )
    VALUES (
        NEW.InventoryID, NEW.SKUID, 'UPDATE',
        OLD.Quantity, NEW.Quantity,
        OLD.ReorderLevel, NEW.ReorderLevel,
        NOW()
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `inventorylog`
--

CREATE TABLE `inventorylog` (
  `ILogID` int(11) NOT NULL,
  `InventoryID` int(11) DEFAULT NULL,
  `SKUID` int(11) DEFAULT NULL,
  `ActionType` enum('INSERT','UPDATE','DELETE') DEFAULT NULL,
  `QuantityBefore` int(11) DEFAULT NULL,
  `QuantityAfter` int(11) DEFAULT NULL,
  `ReorderLevelBefore` int(11) DEFAULT NULL,
  `ReorderLevelAfter` int(11) DEFAULT NULL,
  `ActionTime` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `LogID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `ChangeType` varchar(20) NOT NULL COMMENT 'restock, adjustment, deduction',
  `QuantityBefore` int(11) NOT NULL DEFAULT 0,
  `QuantityChange` int(11) NOT NULL COMMENT 'positive = added, negative = deducted',
  `QuantityAfter` int(11) NOT NULL DEFAULT 0,
  `Note` varchar(255) DEFAULT NULL,
  `LogTime` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productlog`
--

CREATE TABLE `productlog` (
  `PLogID` int(11) NOT NULL,
  `ProductID` int(11) DEFAULT NULL,
  `ActionType` enum('INSERT','UPDATE','DELETE') DEFAULT NULL,
  `OldName` varchar(100) DEFAULT NULL,
  `NewName` varchar(100) DEFAULT NULL,
  `OldBaseSKU` varchar(50) DEFAULT NULL,
  `NewBaseSKU` varchar(50) DEFAULT NULL,
  `ActionTime` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL,
  `CategoryID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `BaseSKU` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `products`
--
DELIMITER $$
CREATE TRIGGER `log_product_delete` AFTER DELETE ON `products` FOR EACH ROW BEGIN
    INSERT INTO ProductLog (
        ProductID, ActionType,
        OldName, NewName,
        OldBaseSKU, NewBaseSKU,
        ActionTime
    )
    VALUES (
        OLD.ProductID, 'DELETE',
        OLD.ProductName, NULL,
        OLD.BaseSKU, NULL,
        NOW()
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_product_insert` AFTER INSERT ON `products` FOR EACH ROW BEGIN
    INSERT INTO ProductLog (
        ProductID, ActionType,
        OldName, NewName,
        OldBaseSKU, NewBaseSKU,
        ActionTime
    )
    VALUES (
        NEW.ProductID, 'INSERT',
        NULL, NEW.ProductName,
        NULL, NEW.BaseSKU,
        NOW()
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_product_update` AFTER UPDATE ON `products` FOR EACH ROW BEGIN
    INSERT INTO ProductLog (
        ProductID, ActionType,
        OldName, NewName,
        OldBaseSKU, NewBaseSKU,
        ActionTime
    )
    VALUES (
        NEW.ProductID, 'UPDATE',
        OLD.ProductName, NEW.ProductName,
        OLD.BaseSKU, NEW.BaseSKU,
        NOW()
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `productskus`
--

CREATE TABLE `productskus` (
  `SKUID` int(11) NOT NULL,
  `ProductID` int(11) NOT NULL,
  `SKUCode` varchar(100) NOT NULL,
  `Size` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `ProductImagePath` varchar(255) DEFAULT NULL,
  `AvailabilityStatus` enum('Available','Unavailable') NOT NULL DEFAULT 'Available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `RoleID` int(11) NOT NULL,
  `RoleName` enum('Manager','Cashier') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`RoleID`, `RoleName`) VALUES
(1, 'Manager'),
(2, 'Cashier');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`SettingKey`, `SettingValue`) VALUES
('contactNumber', '09999292751'),
('stockAlert', '5'),
('storeEmail', 'casacafe@gmail.com'),
('storeName', 'Casa Cafe'),
('taxRate', '5');

-- --------------------------------------------------------

--
-- Table structure for table `transactionarchives`
--

CREATE TABLE `transactionarchives` (
  `ArchiveID` int(11) NOT NULL,
  `TransactionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `TransactionDate` datetime NOT NULL,
  `TotalAmountDue` decimal(10,2) NOT NULL,
  `ArchivedDate` datetime NOT NULL,
  `ArchivedBy` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactiondetails`
--

CREATE TABLE `transactiondetails` (
  `DetailsID` int(11) NOT NULL,
  `TransactionID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `NumberOfItemSold` int(11) NOT NULL,
  `PricePerUnit` decimal(10,2) NOT NULL,
  `PriceAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactiondetailsarchives`
--

CREATE TABLE `transactiondetailsarchives` (
  `ArchiveDetailID` int(11) NOT NULL,
  `ArchiveID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `NumberOfItemSold` int(11) NOT NULL,
  `PricePerUnit` decimal(10,2) NOT NULL,
  `PriceAmount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `TransactionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `TransactionDate` datetime NOT NULL,
  `TotalAmountDue` decimal(10,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL DEFAULT 'Cash',
  `DiscountAmount` decimal(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `RoleID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `PhoneNo` varchar(20) DEFAULT NULL,
  `EmailAddress` varchar(100) NOT NULL,
  `WorkingStatus` enum('Active','Inactive') NOT NULL DEFAULT 'Inactive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`UserID`, `RoleID`, `Username`, `Password`, `FirstName`, `LastName`, `PhoneNo`, `EmailAddress`, `WorkingStatus`) VALUES
(0, 1, 'admin', '$2y$10$k1GNRJiUB4h.f/Kp7aZ7qePYSr15hBidrAC2qO971iEJ4n248UPTy', 'Admin', 'User', '09999292751', 'admin@casacafe.com', 'Inactive');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`CategoryID`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`InventoryID`),
  ADD KEY `SKUID` (`SKUID`);

--
-- Indexes for table `inventorylog`
--
ALTER TABLE `inventorylog`
  ADD PRIMARY KEY (`ILogID`);

--
-- Indexes for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`LogID`),
  ADD KEY `SKUID` (`SKUID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `productlog`
--
ALTER TABLE `productlog`
  ADD PRIMARY KEY (`PLogID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductID`),
  ADD UNIQUE KEY `BaseSKU` (`BaseSKU`),
  ADD KEY `CategoryID` (`CategoryID`);

--
-- Indexes for table `productskus`
--
ALTER TABLE `productskus`
  ADD PRIMARY KEY (`SKUID`),
  ADD UNIQUE KEY `SKUCode` (`SKUCode`),
  ADD KEY `ProductID` (`ProductID`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`RoleID`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`SettingKey`);

--
-- Indexes for table `transactionarchives`
--
ALTER TABLE `transactionarchives`
  ADD PRIMARY KEY (`ArchiveID`),
  ADD KEY `TransactionID` (`TransactionID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `transactiondetails`
--
ALTER TABLE `transactiondetails`
  ADD PRIMARY KEY (`DetailsID`),
  ADD KEY `TransactionID` (`TransactionID`),
  ADD KEY `SKUID` (`SKUID`);

--
-- Indexes for table `transactiondetailsarchives`
--
ALTER TABLE `transactiondetailsarchives`
  ADD PRIMARY KEY (`ArchiveDetailID`),
  ADD KEY `ArchiveID` (`ArchiveID`),
  ADD KEY `SKUID` (`SKUID`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`TransactionID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Username` (`Username`),
  ADD UNIQUE KEY `EmailAddress` (`EmailAddress`),
  ADD KEY `RoleID` (`RoleID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `InventoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventorylog`
--
ALTER TABLE `inventorylog`
  MODIFY `ILogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `LogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productlog`
--
ALTER TABLE `productlog`
  MODIFY `PLogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `ProductID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productskus`
--
ALTER TABLE `productskus`
  MODIFY `SKUID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `RoleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `transactionarchives`
--
ALTER TABLE `transactionarchives`
  MODIFY `ArchiveID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactiondetails`
--
ALTER TABLE `transactiondetails`
  MODIFY `DetailsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactiondetailsarchives`
--
ALTER TABLE `transactiondetailsarchives`
  MODIFY `ArchiveDetailID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `TransactionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`);

--
-- Constraints for table `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`),
  ADD CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`);

--
-- Constraints for table `productskus`
--
ALTER TABLE `productskus`
  ADD CONSTRAINT `productskus_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`);

--
-- Constraints for table `transactionarchives`
--
ALTER TABLE `transactionarchives`
  ADD CONSTRAINT `transactionarchives_ibfk_1` FOREIGN KEY (`TransactionID`) REFERENCES `transactions` (`TransactionID`),
  ADD CONSTRAINT `transactionarchives_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `transactiondetails`
--
ALTER TABLE `transactiondetails`
  ADD CONSTRAINT `transactiondetails_ibfk_1` FOREIGN KEY (`TransactionID`) REFERENCES `transactions` (`TransactionID`),
  ADD CONSTRAINT `transactiondetails_ibfk_2` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`);

--
-- Constraints for table `transactiondetailsarchives`
--
ALTER TABLE `transactiondetailsarchives`
  ADD CONSTRAINT `transactiondetailsarchives_ibfk_1` FOREIGN KEY (`ArchiveID`) REFERENCES `transactionarchives` (`ArchiveID`),
  ADD CONSTRAINT `transactiondetailsarchives_ibfk_2` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`);

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `evt_archive_old_transactions` ON SCHEDULE EVERY 1 DAY STARTS '2026-04-11 00:00:00' ON COMPLETION NOT PRESERVE ENABLE DO CALL ArchiveOldTransactions()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 09:50 AM
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

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `CategoryID` int(11) NOT NULL,
  `CategoryName` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `AvailabilityStatus` enum('Available','Unavailable') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `RoleID` int(11) NOT NULL,
  `RoleName` enum('Manager','Cashier') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `TotalAmountDue` decimal(10,2) NOT NULL
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
  `WorkingStatus` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `InventoryID` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `RoleID` int(11) NOT NULL AUTO_INCREMENT;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

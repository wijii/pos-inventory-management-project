-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 16, 2026 at 12:15 PM
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
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `InventoryID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL CHECK (`Quantity` >= 0),
  `SKUID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productskus`
--

CREATE TABLE `productskus` (
  `SKUID` int(11) NOT NULL,
  `SKUCode` varchar(100) NOT NULL,
  `Size` varchar(10) DEFAULT NULL,
  `Variant` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL CHECK (`Price` >= 0),
  `StockStatus` varchar(20) NOT NULL CHECK (`StockStatus` in ('Available','Low Stocks','Unavailable')),
  `ProductImagePath` varchar(255) NOT NULL,
  `ProductID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactionrecords`
--

CREATE TABLE `transactionrecords` (
  `RecordsID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL CHECK (`Quantity` >= 0),
  `TotalCost` decimal(10,2) NOT NULL,
  `Subtotal` decimal(10,2) GENERATED ALWAYS AS (`Quantity` * `TotalCost`) STORED,
  `TransactionID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `TransactionID` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `TransactionDate` date NOT NULL DEFAULT curdate(),
  `Tax` decimal(5,2) NOT NULL,
  `Discount` decimal(5,2) DEFAULT 0.00,
  `FinalAmount` decimal(10,2) GENERATED ALWAYS AS (`AmountPaid` - `Discount` + `Tax`) STORED,
  `UserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Role` varchar(20) DEFAULT NULL CHECK (`Role` in ('Manager','Cashier')),
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `PhoneNumber` varchar(20) NOT NULL,
  `EmailAddress` varchar(100) NOT NULL,
  `WorkingStatus` varchar(20) DEFAULT NULL CHECK (`WorkingStatus` in ('Active','Inactive')),
  `UserImagePath` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`InventoryID`),
  ADD KEY `SKUID` (`SKUID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`ProductID`),
  ADD UNIQUE KEY `ProductName` (`ProductName`);

--
-- Indexes for table `productskus`
--
ALTER TABLE `productskus`
  ADD PRIMARY KEY (`SKUID`),
  ADD UNIQUE KEY `SKUCode` (`SKUCode`),
  ADD UNIQUE KEY `ProductImagePath` (`ProductImagePath`),
  ADD KEY `ProductID` (`ProductID`);

--
-- Indexes for table `transactionrecords`
--
ALTER TABLE `transactionrecords`
  ADD PRIMARY KEY (`RecordsID`),
  ADD KEY `TransactionID` (`TransactionID`),
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
  ADD UNIQUE KEY `UserImagePath` (`UserImagePath`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `inventory`
--
ALTER TABLE `inventory`
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
-- AUTO_INCREMENT for table `transactionrecords`
--
ALTER TABLE `transactionrecords`
  MODIFY `RecordsID` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`);

--
-- Constraints for table `productskus`
--
ALTER TABLE `productskus`
  ADD CONSTRAINT `productskus_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`);

--
-- Constraints for table `transactionrecords`
--
ALTER TABLE `transactionrecords`
  ADD CONSTRAINT `transactionrecords_ibfk_1` FOREIGN KEY (`TransactionID`) REFERENCES `transactions` (`TransactionID`),
  ADD CONSTRAINT `transactionrecords_ibfk_2` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

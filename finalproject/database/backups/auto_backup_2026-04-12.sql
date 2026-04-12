-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: updatedpos
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `CategoryID` int(11) NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) NOT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Beverages'),(2,'Food');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventories`
--

DROP TABLE IF EXISTS `inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventories` (
  `InventoryID` int(11) NOT NULL AUTO_INCREMENT,
  `SKUID` int(11) NOT NULL,
  `Quantity` int(11) NOT NULL,
  `ReorderLevel` int(11) NOT NULL,
  `LastUpdateTime` datetime NOT NULL,
  PRIMARY KEY (`InventoryID`),
  KEY `SKUID` (`SKUID`),
  CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventories`
--

LOCK TABLES `inventories` WRITE;
/*!40000 ALTER TABLE `inventories` DISABLE KEYS */;
INSERT INTO `inventories` VALUES (1,1,1,0,'2026-04-12 19:22:00'),(2,4,0,0,'2026-04-12 16:03:47'),(3,3,0,0,'2026-04-12 00:03:22'),(4,2,0,0,'2026-04-12 16:13:28'),(5,7,0,0,'2026-04-12 16:10:16'),(6,5,0,0,'2026-04-11 21:13:54');
/*!40000 ALTER TABLE `inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_logs`
--

DROP TABLE IF EXISTS `inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory_logs` (
  `LogID` int(11) NOT NULL AUTO_INCREMENT,
  `SKUID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `ChangeType` varchar(20) NOT NULL COMMENT 'restock, adjustment, deduction',
  `QuantityBefore` int(11) NOT NULL DEFAULT 0,
  `QuantityChange` int(11) NOT NULL COMMENT 'positive = added, negative = deducted',
  `QuantityAfter` int(11) NOT NULL DEFAULT 0,
  `Note` varchar(255) DEFAULT NULL,
  `LogTime` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`LogID`),
  KEY `SKUID` (`SKUID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`),
  CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_logs`
--

LOCK TABLES `inventory_logs` WRITE;
/*!40000 ALTER TABLE `inventory_logs` DISABLE KEYS */;
INSERT INTO `inventory_logs` VALUES (1,1,0,'restock',0,1,1,'Manual stock update','2026-04-11 20:18:12'),(2,1,0,'adjustment',1,-1,0,'Manual adjustment','2026-04-11 20:19:19'),(3,1,0,'restock',0,1,1,'Manual stock update','2026-04-11 20:19:30'),(4,4,0,'restock',0,1,1,'Manual stock update','2026-04-11 20:20:44'),(5,3,0,'restock',0,1,1,'Manual stock update','2026-04-11 20:20:46'),(6,2,0,'restock',0,1,1,'Manual stock update','2026-04-11 20:20:47'),(7,1,0,'deduction',1,-1,0,'Sale - Transaction #1','2026-04-11 20:24:22'),(8,7,0,'restock',0,1,1,'Manual stock update','2026-04-11 21:13:06'),(9,5,0,'restock',0,1,1,'Manual stock update','2026-04-11 21:13:43'),(10,5,0,'adjustment',1,-1,0,'Manual adjustment','2026-04-11 21:13:54'),(11,2,15,'deduction',1,-1,0,'Sale - Transaction #2','2026-04-12 00:02:32'),(12,3,15,'deduction',1,-1,0,'Sale - Transaction #3','2026-04-12 00:03:22'),(13,4,0,'deduction',1,-1,0,'Sale - Transaction #4','2026-04-12 16:03:47'),(14,7,0,'deduction',1,-1,0,'Sale - Transaction #5','2026-04-12 16:10:16'),(15,2,0,'restock',0,2,2,'Manual stock update','2026-04-12 16:13:17'),(16,2,0,'deduction',2,-2,0,'Sale - Transaction #6','2026-04-12 16:13:28'),(17,1,0,'restock',0,2,2,'Manual stock update','2026-04-12 19:19:35'),(18,1,0,'deduction',2,-2,0,'Sale - Transaction #7','2026-04-12 19:19:42'),(19,1,0,'restock',0,2,2,'Manual stock update','2026-04-12 19:21:54'),(20,1,0,'deduction',2,-1,1,'Sale - Transaction #8','2026-04-12 19:22:00');
/*!40000 ALTER TABLE `inventory_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `ProductID` int(11) NOT NULL AUTO_INCREMENT,
  `CategoryID` int(11) NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `BaseSKU` varchar(50) NOT NULL,
  PRIMARY KEY (`ProductID`),
  UNIQUE KEY `BaseSKU` (`BaseSKU`),
  KEY `CategoryID` (`CategoryID`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,'manokto','MA0054'),(2,1,'juice','JU0076'),(3,1,'i love my gf','IL0016');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productskus`
--

DROP TABLE IF EXISTS `productskus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productskus` (
  `SKUID` int(11) NOT NULL AUTO_INCREMENT,
  `ProductID` int(11) NOT NULL,
  `SKUCode` varchar(100) NOT NULL,
  `Size` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) NOT NULL,
  `ProductImagePath` varchar(255) DEFAULT NULL,
  `AvailabilityStatus` enum('Available','Unavailable') NOT NULL DEFAULT 'Available',
  PRIMARY KEY (`SKUID`),
  UNIQUE KEY `SKUCode` (`SKUCode`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `productskus_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `products` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productskus`
--

LOCK TABLES `productskus` WRITE;
/*!40000 ALTER TABLE `productskus` DISABLE KEYS */;
INSERT INTO `productskus` VALUES (1,1,'MA0054S',NULL,20.00,'database/uploadLogo/product_1775909875_2802.jpg','Available'),(2,2,'JU0076S','Small',1.00,'database/uploadLogo/product_1775910031_7451.jpg','Available'),(3,2,'JU0076M','Medium',1.00,'database/uploadLogo/product_1775910031_7451.jpg','Available'),(4,2,'JU0076L','Large',1.00,'database/uploadLogo/product_1775910031_7451.jpg','Available'),(5,3,'IL0016S','Small',100.00,'','Available'),(6,3,'IL0016M','Medium',150.00,'','Available'),(7,3,'IL0016L','Large',200.00,'','Available');
/*!40000 ALTER TABLE `productskus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `RoleID` int(11) NOT NULL AUTO_INCREMENT,
  `RoleName` enum('Manager','Cashier') NOT NULL,
  PRIMARY KEY (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Manager'),(2,'Cashier');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `SettingKey` varchar(100) NOT NULL,
  `SettingValue` text NOT NULL,
  PRIMARY KEY (`SettingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('contactNumber','09999292751'),('stockAlert','5'),('storeEmail','casacafe@gmail.com'),('storeName','lugiad'),('taxRate','12');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactionarchives`
--

DROP TABLE IF EXISTS `transactionarchives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactionarchives` (
  `ArchiveID` int(11) NOT NULL AUTO_INCREMENT,
  `TransactionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `TransactionDate` datetime NOT NULL,
  `TotalAmountDue` decimal(10,2) NOT NULL,
  `ArchivedDate` datetime NOT NULL,
  `ArchivedBy` varchar(100) NOT NULL,
  PRIMARY KEY (`ArchiveID`),
  KEY `TransactionID` (`TransactionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `transactionarchives_ibfk_1` FOREIGN KEY (`TransactionID`) REFERENCES `transactions` (`TransactionID`),
  CONSTRAINT `transactionarchives_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactionarchives`
--

LOCK TABLES `transactionarchives` WRITE;
/*!40000 ALTER TABLE `transactionarchives` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactionarchives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactiondetails`
--

DROP TABLE IF EXISTS `transactiondetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactiondetails` (
  `DetailsID` int(11) NOT NULL AUTO_INCREMENT,
  `TransactionID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `NumberOfItemSold` int(11) NOT NULL,
  `PricePerUnit` decimal(10,2) NOT NULL,
  `PriceAmount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`DetailsID`),
  KEY `TransactionID` (`TransactionID`),
  KEY `SKUID` (`SKUID`),
  CONSTRAINT `transactiondetails_ibfk_1` FOREIGN KEY (`TransactionID`) REFERENCES `transactions` (`TransactionID`),
  CONSTRAINT `transactiondetails_ibfk_2` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactiondetails`
--

LOCK TABLES `transactiondetails` WRITE;
/*!40000 ALTER TABLE `transactiondetails` DISABLE KEYS */;
INSERT INTO `transactiondetails` VALUES (1,1,1,1,20.00,20.00),(2,2,2,1,1.00,1.00),(3,3,3,1,1.00,1.00),(4,4,4,1,1.00,1.00),(5,5,7,1,200.00,200.00),(6,6,2,2,1.00,2.00),(7,7,1,2,20.00,40.00),(8,8,1,1,20.00,20.00);
/*!40000 ALTER TABLE `transactiondetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactiondetailsarchives`
--

DROP TABLE IF EXISTS `transactiondetailsarchives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactiondetailsarchives` (
  `ArchiveDetailID` int(11) NOT NULL AUTO_INCREMENT,
  `ArchiveID` int(11) NOT NULL,
  `SKUID` int(11) NOT NULL,
  `NumberOfItemSold` int(11) NOT NULL,
  `PricePerUnit` decimal(10,2) NOT NULL,
  `PriceAmount` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ArchiveDetailID`),
  KEY `ArchiveID` (`ArchiveID`),
  KEY `SKUID` (`SKUID`),
  CONSTRAINT `transactiondetailsarchives_ibfk_1` FOREIGN KEY (`ArchiveID`) REFERENCES `transactionarchives` (`ArchiveID`),
  CONSTRAINT `transactiondetailsarchives_ibfk_2` FOREIGN KEY (`SKUID`) REFERENCES `productskus` (`SKUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactiondetailsarchives`
--

LOCK TABLES `transactiondetailsarchives` WRITE;
/*!40000 ALTER TABLE `transactiondetailsarchives` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactiondetailsarchives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `TransactionID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `AmountPaid` decimal(10,2) NOT NULL,
  `TransactionDate` datetime NOT NULL,
  `TotalAmountDue` decimal(10,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL DEFAULT 'Cash',
  `DiscountAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`TransactionID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,0,200.00,'2026-04-11 20:24:22',21.00,'Cash',0.00),(2,15,100.00,'2026-04-12 00:02:32',1.05,'Cash',0.00),(3,15,100.00,'2026-04-12 00:03:22',0.84,'Cash',0.20),(4,0,123.00,'2026-04-12 16:03:47',1.12,'Cash',0.00),(5,0,12321.00,'2026-04-12 16:10:16',179.20,'Cash',40.00),(6,0,3123.00,'2026-04-12 16:13:28',2.24,'Cash',0.00),(7,0,2131.00,'2026-04-12 19:19:42',44.80,'Cash',0.00),(8,0,23123.00,'2026-04-12 19:22:00',22.40,'Cash',0.00);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `RoleID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `PhoneNo` varchar(20) DEFAULT NULL,
  `EmailAddress` varchar(100) NOT NULL,
  `WorkingStatus` enum('Active','Inactive') NOT NULL DEFAULT 'Inactive',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`),
  UNIQUE KEY `EmailAddress` (`EmailAddress`),
  KEY `RoleID` (`RoleID`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `roles` (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (0,1,'admin','$2y$10$k1GNRJiUB4h.f/Kp7aZ7qePYSr15hBidrAC2qO971iEJ4n248UPTy','Admin','User','09999292751','admin@casacafe.com','Active'),(1,2,'cashier','cashier123','yanah','quita','00921391','awdawd@gmail.com','Inactive'),(2,2,'quitalouie3','$2y$10$f7hs5I.m15eCtGQw9xXNce5WPyuXz8cM2MFqJHPjtwftWihPoxQ16','123','','43535','quitalouie3@gmail.com','Inactive'),(5,2,'qqwer','$2y$10$qaxo1/EZKqQxjuamQqkqfepJR5vIY5VamYJ0Bt3joYS88ZoBopSVO','qwerty','','1231231','qqwer@gmail.com','Inactive'),(13,2,'yanahgi','$2y$10$IWB.Kz5xnfreCGYao7C6hONVsjUXHgUts8lUd2aB/Se39DUIPYxg6','Luigi','Quita','1232131','quitaloui@gmail.com','Inactive'),(14,2,'qwe','$2y$10$zPV/53KksNjy7IvDC6v8mOcPvPkvDgsPmPOz6xGFMrBymMEHGa/Qe','lad','','Cashier','qwe','Inactive'),(15,2,'lsa','$2y$10$BGK.db8T0Qo7w5t8g62GKu6jpIxgNAgvg7LuKBKfKhXO/rvyRvtba','qwe','qwe','091231','quitaluigi927@gmail.com','Inactive');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 19:59:07

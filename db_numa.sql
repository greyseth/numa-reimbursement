-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2025 at 05:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_numa`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id_category` int(10) UNSIGNED NOT NULL,
  `category` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id_category`, `category`) VALUES
(1, 'Perizinan dan Legalitas'),
(2, 'Penginapan'),
(3, 'Pembelian Tiket'),
(4, 'Sewa Kendaraan'),
(5, 'Allowance Crew'),
(6, 'Biaya Transportasi'),
(7, 'Biaya Konsumsi'),
(8, 'Biaya Survey Lokasi'),
(9, 'Biaya Lain-Lain');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id_item` int(10) UNSIGNED NOT NULL,
  `id_request` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(11) NOT NULL,
  `date_purchased` date DEFAULT NULL,
  `filename` text NOT NULL,
  `id_category` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `items`
--
DELIMITER $$
CREATE TRIGGER `items_insert` AFTER INSERT ON `items` FOR EACH ROW BEGIN
INSERT INTO items_approval(id_item) VALUES(NEW.id_item);
UPDATE requests SET status = 'pending' WHERE id_request = NEW.id_request;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `items_approval`
--

CREATE TABLE `items_approval` (
  `id_item` int(10) UNSIGNED NOT NULL,
  `id_approver` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `file` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `items_approval`
--
DELIMITER $$
CREATE TRIGGER `items_approval_update` AFTER UPDATE ON `items_approval` FOR EACH ROW BEGIN    
DECLARE approved_count INT;    
DECLARE rejected_count INT;    
DECLARE total_count INT;    


SELECT SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), COUNT(*) 
INTO approved_count, rejected_count, total_count 
FROM items_approval
JOIN items ON items.id_item = items_approval.id_item
WHERE items.id_request = (SELECT id_request FROM items WHERE id_item = NEW.id_item);


IF approved_count > 0 THEN
    UPDATE requests SET status = 'approved' WHERE id_request = (SELECT id_request FROM items WHERE id_item = NEW.id_item);
ELSEIF rejected_count > 0 AND approved_count < 1 THEN
    UPDATE requests SET status = 'rejected' WHERE id_request = (SELECT id_request FROM items WHERE id_item = NEW.id_item);
ELSE
    UPDATE requests SET status = 'pending' WHERE id_request = (SELECT id_request FROM items WHERE id_item = NEW.id_item);
END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id_request` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date_created` date NOT NULL,
  `status` enum('pending','approved','paid','rejected') NOT NULL DEFAULT 'pending',
  `id_user` int(10) UNSIGNED DEFAULT NULL,
  `date_updated` date DEFAULT NULL,
  `type` enum('reimburse','petty cash') DEFAULT NULL,
  `bank_number` int(25) DEFAULT NULL,
  `bank_name` varchar(75) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `requests`
--
DELIMITER $$
CREATE TRIGGER `requests_insert` AFTER INSERT ON `requests` FOR EACH ROW BEGIN
INSERT INTO requests_finance(id_request, status) VALUES(NEW.id_request, 'pending');
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `requests_finance`
--

CREATE TABLE `requests_finance` (
  `id_request` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `id_finance` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `requests_finance`
--
DELIMITER $$
CREATE TRIGGER `requests_finance_update` AFTER UPDATE ON `requests_finance` FOR EACH ROW BEGIN
IF NEW.status = 'approved' THEN
UPDATE requests SET status = 'paid' WHERE id_request = NEW.id_request;
ELSEIF NEW.status = 'rejected' THEN
UPDATE requests SET status = 'rejected' WHERE id_request = NEW.id_request;
END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id_role` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(75) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id_role`, `role_name`) VALUES
(1, 'requestor'),
(2, 'verification'),
(3, 'approver'),
(4, 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int(10) UNSIGNED NOT NULL,
  `username` varchar(75) NOT NULL,
  `password` varchar(60) NOT NULL,
  `email` varchar(255) NOT NULL,
  `id_role` int(10) UNSIGNED DEFAULT NULL,
  `nik` int(16) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `username`, `password`, `email`, `id_role`, `nik`, `active`) VALUES
(1, 'Admin', '$2a$12$kgmok2Mfno6BVC2.v59F8OLZQ4Jj8w59pm0NR6j2wwfV4XkYVBrfe', 'admin', 4, 2147483647, 1),
(2, 'User', '$2b$10$M/yMbGsb.5XDKsnmjrwVk.WC1mWQR/iTexX69PkSUnc6pwDvj2aL.', 'user@gmail.com', 1, 2147483647, 1),
(3, 'Finance', '$2b$10$fdf4vPWeCXXvUbAOj0zBwOaRhz/3sdIhMOHrfSOvGXFmMxd0p31XW', 'finance@gmail.com', 3, 2147483647, 1),
(4, 'Approver', '$2b$10$8y6izp5BYE47r9dF9./nmODtTvsW.EOCiRlCfHQQ7fB82t0uWFmmi', 'approver@gmail.com', 2, 12321348, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_category`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `id_request` (`id_request`),
  ADD KEY `id_category` (`id_category`);

--
-- Indexes for table `items_approval`
--
ALTER TABLE `items_approval`
  ADD UNIQUE KEY `id_item` (`id_item`),
  ADD KEY `id_approver` (`id_approver`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id_request`),
  ADD KEY `id_user` (`id_user`);
ALTER TABLE `requests` ADD FULLTEXT KEY `requests_index` (`title`,`description`);

--
-- Indexes for table `requests_finance`
--
ALTER TABLE `requests_finance`
  ADD UNIQUE KEY `id_request` (`id_request`),
  ADD KEY `id_finance` (`id_finance`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_role`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_role` (`id_role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id_category` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id_item` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id_request` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id_role` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`id_request`) REFERENCES `requests` (`id_request`) ON DELETE CASCADE,
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`id_category`) REFERENCES `categories` (`id_category`);

--
-- Constraints for table `items_approval`
--
ALTER TABLE `items_approval`
  ADD CONSTRAINT `items_approval_ibfk_1` FOREIGN KEY (`id_item`) REFERENCES `items` (`id_item`) ON DELETE CASCADE,
  ADD CONSTRAINT `items_approval_ibfk_2` FOREIGN KEY (`id_approver`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `requests_finance`
--
ALTER TABLE `requests_finance`
  ADD CONSTRAINT `requests_finance_ibfk_2` FOREIGN KEY (`id_finance`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `requests_finance_ibfk_3` FOREIGN KEY (`id_request`) REFERENCES `requests` (`id_request`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

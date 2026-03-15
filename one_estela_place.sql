-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 15, 2026 at 04:45 PM
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
-- Database: `one_estela_place`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `office_room_id` int(11) NOT NULL,
  `check_in_date` datetime NOT NULL,
  `check_out_date` datetime NOT NULL,
  `number_of_guests` int(11) DEFAULT NULL,
  `special_requests` longtext DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `office_room_id`, `check_in_date`, `check_out_date`, `number_of_guests`, `special_requests`, `status`, `total_price`, `created_at`, `updated_at`) VALUES
(3, 2, 1, '2026-03-22 23:38:02', '2026-03-23 02:38:02', 15, 'Please arrange catering for 15 people', 'confirmed', 750.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(4, 3, 2, '2026-03-29 23:38:02', '2026-03-30 03:38:02', 50, 'Need projector and sound system for presentation', 'confirmed', 600.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(5, 2, 3, '2026-04-05 23:38:02', '2026-04-06 01:38:02', 8, 'Small team meeting, need whiteboard', 'confirmed', 150.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(6, 3, 4, '2026-03-18 23:38:02', '2026-03-19 02:38:02', 10, 'Birthday celebration, need decorations allowed', 'pending', 255.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(7, 2, 2, '2026-03-20 23:38:02', '2026-03-21 04:38:02', 80, 'Corporate training session, need WiFi for all attendees', 'pending', 750.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(8, 3, 1, '2026-03-25 23:38:02', '2026-03-26 03:38:02', 20, 'Executive board meeting, need coffee service', 'pending', 1000.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(9, 2, 3, '2026-03-08 23:38:02', '2026-03-09 02:38:02', 6, 'Team planning session', 'completed', 225.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(10, 3, 2, '2026-03-01 23:38:02', '2026-03-02 05:38:02', 75, 'Product launch event', 'completed', 900.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02'),
(11, 2, 4, '2026-03-17 23:38:02', '2026-03-18 01:38:02', 12, 'Client meeting - cancelled due to schedule conflict', 'cancelled', 170.00, '2026-03-15 15:38:02', '2026-03-15 15:38:02');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `message_type` enum('text','file','system') DEFAULT 'text',
  `file_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `sender_id`, `receiver_id`, `booking_id`, `message`, `message_type`, `file_url`, `is_read`, `created_at`) VALUES
(1, 4, NULL, NULL, '🔄 [Customer requested human support — chat escalated from AI assistant]', 'system', NULL, 1, '2026-03-15 15:35:30'),
(2, 1, 4, NULL, 'hi!', 'text', NULL, 0, '2026-03-15 15:35:44'),
(3, 4, NULL, NULL, 'etrhryh', 'text', NULL, 1, '2026-03-15 15:35:49');

-- --------------------------------------------------------

--
-- Table structure for table `cms_content`
--

CREATE TABLE `cms_content` (
  `id` int(11) NOT NULL,
  `page_type` enum('homepage','venue','office_room','about','faq','reviews') DEFAULT 'homepage',
  `section_name` varchar(255) DEFAULT NULL,
  `content_key` varchar(255) DEFAULT NULL,
  `content_value` longtext DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cms_content`
--

INSERT INTO `cms_content` (`id`, `page_type`, `section_name`, `content_key`, `content_value`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'homepage', 'hero', 'title', 'Welcome to One Estela Place', 1, 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(2, 'homepage', 'hero', 'description', 'Premium venue for your perfect event', 2, 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 'homepage', 'features', 'title', 'State-of-the-Art Facilities', 3, 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(4, 'homepage', 'features', 'description', 'Our venue features cutting-edge technology and elegant design', 4, 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `status` enum('unread','read','replied') DEFAULT 'unread',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `user_id`, `name`, `email`, `subject`, `message`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 'John Smith', 'john@example.com', 'Venue Inquiry', 'I am interested in booking your venue for a corporate event', 'unread', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(2, NULL, 'Sarah Johnson', 'sarah@example.com', 'Pricing Question', 'Can you provide pricing for a 500-person event?', 'unread', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 2, 'John Doe', 'user@example.com', 'Question about Corporate Packages', 'Hi, I would like to know if you offer special rates for corporate clients who book regularly. We have monthly meetings and would love to partner with you.', 'unread', '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(4, 3, 'Jane Smith', 'client2@example.com', 'Catering Services Inquiry', 'Do you provide in-house catering services? We are planning a full-day workshop for 50 people and need breakfast, lunch, and snacks.', 'unread', '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(5, NULL, 'Michael Brown', 'michael.brown@company.com', 'Wedding Reception Venue', 'I am interested in booking your venue for a wedding reception in June. Can you provide information about capacity, pricing, and available dates?', 'unread', '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(6, NULL, 'Sarah Johnson', 'sarah.j@email.com', 'Thank You!', 'Just wanted to say thank you for the wonderful experience at our event last week. Everything was perfect and your team was amazing!', 'read', '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(7, 2, 'John Doe', 'user@example.com', 'Equipment Rental', 'Do you rent out additional equipment like microphones, speakers, or video cameras? We might need these for our upcoming presentation.', 'replied', '2026-03-15 15:38:50', '2026-03-15 15:38:50');

-- --------------------------------------------------------

--
-- Table structure for table `office_rooms`
--

CREATE TABLE `office_rooms` (
  `id` int(11) NOT NULL,
  `venue_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `status` enum('available','maintenance','booked') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `office_rooms`
--

INSERT INTO `office_rooms` (`id`, `venue_id`, `name`, `description`, `capacity`, `price_per_hour`, `image_url`, `amenities`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Executive Suite', 'Premium board room with panoramic views', 20, 250.00, '/images/executive-suite.jpg', '[\"WiFi\", \"Projector\", \"Whiteboard\", \"Coffee Service\"]', 'available', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(2, 1, 'Conference Hall', 'Large conference space suitable for presentations', 100, 150.00, '/images/conference-hall.jpg', '[\"WiFi\", \"Audio System\", \"Stage\", \"Catering Available\"]', 'available', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 1, 'Meeting Room A', 'Intimate meeting space for small teams', 8, 75.00, '/images/meeting-room-a.jpg', '[\"WiFi\", \"Whiteboard\", \"Video Conference Setup\"]', 'available', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(4, 1, 'Meeting Room B', 'Flexible meeting space', 10, 85.00, '/images/meeting-room-b.jpg', '[\"WiFi\", \"Whiteboard\", \"Smart TV\"]', 'available', '2026-03-15 15:30:55', '2026-03-15 15:30:55');

-- --------------------------------------------------------

--
-- Table structure for table `payment_proofs`
--

CREATE TABLE `payment_proofs` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_method` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `proof_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verification_notes` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `report_type` enum('bug','issue','feedback','complaint') DEFAULT 'feedback',
  `title` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `office_room_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(500) DEFAULT NULL,
  `review_text` longtext DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `office_room_id`, `booking_id`, `rating`, `title`, `review_text`, `is_approved`, `created_at`, `updated_at`) VALUES
(1, 2, 1, NULL, 5, 'Exceptional Experience', 'The executive suite was perfect for our board meeting. Highly professional staff and excellent facilities.', 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(2, 3, 2, NULL, 5, 'Outstanding Service', 'Great venue for our conference. The audio/visual setup was flawless and the team was very helpful.', 1, '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 2, 1, 9, 5, 'Excellent Venue!', 'The Executive Suite exceeded our expectations. Perfect for our board meeting with stunning views and top-notch facilities.', 1, '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(4, 3, 2, 10, 5, 'Perfect for Large Events', 'Conference Hall was ideal for our product launch. Great audio system and the staff was incredibly helpful.', 1, '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(5, 2, 3, NULL, 4, 'Great Meeting Space', 'Meeting Room A was perfect for our team session. Clean, well-equipped, and good WiFi. Only minor issue was parking.', 1, '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(6, 3, 1, NULL, 5, 'Highly Recommended', 'Professional service, beautiful venue, and excellent amenities. Will definitely book again for future events.', 1, '2026-03-15 15:38:50', '2026-03-15 15:38:50');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `position` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `user_id`, `position`, `department`, `hire_date`, `salary`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Event Manager', 'Operations', '2024-03-15', 65000.00, 'active', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(2, 3, 'Technical Manager', 'Technical', '2025-03-15', 60000.00, 'active', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 2, 'Event Coordinator', 'Operations', '2025-03-15', 45000.00, 'active', '2026-03-15 15:38:50', '2026-03-15 15:38:50'),
(4, 3, 'Facilities Manager', 'Maintenance', '2024-03-15', 55000.00, 'active', '2026-03-15 15:38:50', '2026-03-15 15:38:50');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `type` enum('payment','refund','fee') DEFAULT 'payment',
  `amount` decimal(10,2) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` enum('completed','pending','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','admin','staff') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `phone`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin@oneestela.com', '$2b$10$6rLgpIrHlEJKJuM8Bm47KeWGhx591L7/qq4o1JZjEIG6znGw/l8qC', 'Admin User', '+1-234-567-8900', 'admin', '2026-03-15 15:30:55', '2026-03-15 15:31:33'),
(2, 'user@example.com', '$2b$10$YourHashedPasswordHere', 'John Doe', '+1-234-567-8901', 'user', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(3, 'client2@example.com', '$2b$10$YourHashedPasswordHere', 'Jane Smith', '+1-234-567-8902', 'user', '2026-03-15 15:30:55', '2026-03-15 15:30:55'),
(4, 'nigha@gmail.com', '$2b$10$RmfaVpC/COpGJlDHkumGie3H7qRwfQTVa0pgQaJfH3n7.xMymEep2', 'nigha black', NULL, 'user', '2026-03-15 15:35:02', '2026-03-15 15:35:02');

-- --------------------------------------------------------

--
-- Table structure for table `user_info`
--

CREATE TABLE `user_info` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_email` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `venues`
--

CREATE TABLE `venues` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `location` varchar(500) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `price_per_hour` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `venues`
--

INSERT INTO `venues` (`id`, `name`, `description`, `location`, `capacity`, `price_per_hour`, `image_url`, `amenities`, `created_at`, `updated_at`) VALUES
(1, 'One Estela Place', 'Premium event venue with elegant design and world-class facilities', '123 Estela Street, Downtown', 500, 150.00, '/images/venue-main.jpg', NULL, '2026-03-15 15:30:55', '2026-03-15 15:30:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_office_room_id` (`office_room_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_check_in_date` (`check_in_date`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sender_id` (`sender_id`),
  ADD KEY `idx_receiver_id` (`receiver_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_is_read` (`is_read`);

--
-- Indexes for table `cms_content`
--
ALTER TABLE `cms_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_page_section` (`page_type`,`section_name`,`content_key`),
  ADD KEY `idx_page_type` (`page_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `office_rooms`
--
ALTER TABLE `office_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_venue_id` (`venue_id`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_office_room_id` (`office_room_id`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_is_approved` (`is_approved`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Indexes for table `user_info`
--
ALTER TABLE `user_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `venues`
--
ALTER TABLE `venues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cms_content`
--
ALTER TABLE `cms_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `office_rooms`
--
ALTER TABLE `office_rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_info`
--
ALTER TABLE `user_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `venues`
--
ALTER TABLE `venues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`office_room_id`) REFERENCES `office_rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_messages_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `office_rooms`
--
ALTER TABLE `office_rooms`
  ADD CONSTRAINT `office_rooms_ibfk_1` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_proofs`
--
ALTER TABLE `payment_proofs`
  ADD CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`office_room_id`) REFERENCES `office_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_info`
--
ALTER TABLE `user_info`
  ADD CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

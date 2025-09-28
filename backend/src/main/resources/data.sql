-- =============================================
-- ResearchHub Mock Data
-- This file runs automatically on application startup
-- =============================================

-- First, let's create a function to generate UUIDs if it doesn't exist
SET @uuid_count = 0;

-- Insert Categories (if they don't exist)
INSERT IGNORE INTO categories (id, name, description) VALUES
-- AI/ML Categories
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440001'), 'Artificial Intelligence', 'Research papers in Artificial Intelligence'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440002'), 'Machine Learning', 'Research papers in Machine Learning'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440003'), 'Data Science', 'Research papers in Data Science'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440004'), 'Computer Vision', 'Research papers in Computer Vision'),

-- Computer Science Categories
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440005'), 'Computer Science', 'Research papers in Computer Science'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440006'), 'Software Engineering', 'Research papers in Software Engineering'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440007'), 'Cybersecurity', 'Research papers in Cybersecurity'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440008'), 'Networks', 'Research papers in Networks'),

-- Science Categories
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440009'), 'Physics', 'Research papers in Physics'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440010'), 'Biology', 'Research papers in Biology'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440011'), 'Chemistry', 'Research papers in Chemistry'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440012'), 'Mathematics', 'Research papers in Mathematics'),

-- Interdisciplinary Categories
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440013'), 'Bioinformatics', 'Research papers in Bioinformatics'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440014'), 'Neuroscience', 'Research papers in Neuroscience'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440015'), 'Environmental Science', 'Research papers in Environmental Science'),
(UUID_TO_BIN('550e8400-e29b-11d4-a716-446655440016'), 'Healthcare', 'Research papers in Healthcare');

-- Insert Mock Papers
INSERT IGNORE INTO papers (id, title, author, abstract_text, publication_year, uploaded_at, file_path) VALUES
-- Paper 1: AI Research
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440001'), 
 'Advanced Machine Learning Techniques for Predictive Analytics', 
 'Dr. Sarah Chen, Prof. Michael Zhang', 
 'This paper introduces a novel machine learning framework that significantly improves prediction accuracy in complex datasets. Our approach combines deep learning with traditional statistical methods to achieve state-of-the-art results across multiple benchmarks. The methodology is particularly effective for time-series data and has applications in finance, healthcare, and climate modeling.',
 2024, 
 NOW() - INTERVAL 15 DAY, 
 'uploads/mock-paper-1.pdf'),

-- Paper 2: Computer Vision
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440002'), 
 'Real-Time Object Detection in Autonomous Vehicles', 
 'Dr. James Rodriguez, Dr. Emily Wang', 
 'We present a new computer vision algorithm that enables real-time object detection for autonomous driving systems. The system achieves 99.2% accuracy in identifying pedestrians, vehicles, and obstacles under various weather conditions. Our model reduces computational requirements by 40% compared to existing solutions while maintaining high precision.',
 2023, 
 NOW() - INTERVAL 45 DAY, 
 'uploads/mock-paper-2.pdf'),

-- Paper 3: Data Science
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440003'), 
 'Big Data Analytics for Healthcare Optimization', 
 'Prof. Lisa Thompson, Dr. Robert Kim', 
 'This research demonstrates how big data analytics can optimize hospital resource allocation and patient care. By analyzing 5 years of patient data, we developed predictive models that reduce waiting times by 30% and improve resource utilization. The framework is scalable and can be adapted to healthcare systems worldwide.',
 2024, 
 NOW() - INTERVAL 10 DAY, 
 'uploads/mock-paper-3.pdf'),

-- Paper 4: Cybersecurity
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440004'), 
 'Blockchain-Based Security Protocol for IoT Networks', 
 'Dr. Maria Gonzalez, Prof. David Patel', 
 'We propose a new security protocol that leverages blockchain technology to protect IoT devices from cyber attacks. The protocol ensures data integrity, prevents unauthorized access, and provides real-time threat detection. Testing across 10,000 simulated devices showed 99.9% effectiveness in preventing common attack vectors.',
 2023, 
 NOW() - INTERVAL 60 DAY, 
 'uploads/mock-paper-4.pdf'),

-- Paper 5: Bioinformatics
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440005'), 
 'Genomic Data Analysis Using Machine Learning', 
 'Dr. Jennifer Lee, Dr. Kevin Zhang', 
 'This paper presents a machine learning approach for analyzing genomic data to identify disease markers. Our method processes whole-genome sequencing data 10x faster than existing tools while maintaining 98% accuracy. The algorithm has potential applications in personalized medicine and early disease detection.',
 2024, 
 NOW() - INTERVAL 5 DAY, 
 'uploads/mock-paper-5.pdf'),

-- Paper 6: Environmental Science
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440006'), 
 'Climate Change Impact on Coastal Ecosystems', 
 'Dr. Amanda Wilson, Prof. Richard Brown', 
 'We analyze 20 years of satellite data to assess the impact of climate change on coastal biodiversity. The study reveals significant correlations between temperature changes and species migration patterns. Our findings provide actionable insights for conservation efforts and policy making.',
 2023, 
 NOW() - INTERVAL 90 DAY, 
 'uploads/mock-paper-6.pdf'),

-- Paper 7: Software Engineering
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440007'), 
 'Agile Methodology in Large-Scale Software Development', 
 'Dr. Thomas Anderson, Dr. Sophia Chen', 
 'This research evaluates the effectiveness of agile methodologies in enterprise software development. Through case studies of 15 major projects, we identify best practices and common pitfalls. The paper provides a framework for adapting agile principles to large, distributed teams.',
 2024, 
 NOW() - INTERVAL 30 DAY, 
 'uploads/mock-paper-7.pdf'),

-- Paper 8: Neuroscience
(UUID_TO_BIN('660e8400-e29b-11d4-a716-446655440008'), 
 'fMRI Analysis of Cognitive Processes', 
 'Dr. Rachel Green, Prof. Mark Johnson', 
 'Using functional MRI data, we map cognitive processes related to decision-making and problem-solving. The study involved 500 participants and reveals new insights into neural pathways. Our analysis techniques improve signal detection accuracy by 25% compared to standard methods.',
 2023, 
 NOW() - INTERVAL 75 DAY, 
 'uploads/mock-paper-8.pdf');

-- Link Papers to Categories (Many-to-Many relationships)
INSERT IGNORE INTO paper_categories (paper_id, category_id) VALUES
-- Paper 1 categories
((SELECT id FROM papers WHERE title LIKE '%Machine Learning%'), (SELECT id FROM categories WHERE name = 'Artificial Intelligence')),
((SELECT id FROM papers WHERE title LIKE '%Machine Learning%'), (SELECT id FROM categories WHERE name = 'Machine Learning')),
((SELECT id FROM papers WHERE title LIKE '%Machine Learning%'), (SELECT id FROM categories WHERE name = 'Data Science')),

-- Paper 2 categories
((SELECT id FROM papers WHERE title LIKE '%Object Detection%'), (SELECT id FROM categories WHERE name = 'Computer Vision')),
((SELECT id FROM papers WHERE title LIKE '%Object Detection%'), (SELECT id FROM categories WHERE name = 'Artificial Intelligence')),

-- Paper 3 categories
((SELECT id FROM papers WHERE title LIKE '%Healthcare Optimization%'), (SELECT id FROM categories WHERE name = 'Data Science')),
((SELECT id FROM papers WHERE title LIKE '%Healthcare Optimization%'), (SELECT id FROM categories WHERE name = 'Healthcare')),

-- Paper 4 categories
((SELECT id FROM papers WHERE title LIKE '%IoT Networks%'), (SELECT id FROM categories WHERE name = 'Cybersecurity')),
((SELECT id FROM papers WHERE title LIKE '%IoT Networks%'), (SELECT id FROM categories WHERE name = 'Networks')),

-- Paper 5 categories
((SELECT id FROM papers WHERE title LIKE '%Genomic Data%'), (SELECT id FROM categories WHERE name = 'Bioinformatics')),
((SELECT id FROM papers WHERE title LIKE '%Genomic Data%'), (SELECT id FROM categories WHERE name = 'Machine Learning')),

-- Paper 6 categories
((SELECT id FROM papers WHERE title LIKE '%Coastal Ecosystems%'), (SELECT id FROM categories WHERE name = 'Environmental Science')),
((SELECT id FROM papers WHERE title LIKE '%Coastal Ecosystems%'), (SELECT id FROM categories WHERE name = 'Biology')),

-- Paper 7 categories
((SELECT id FROM papers WHERE title LIKE '%Software Development%'), (SELECT id FROM categories WHERE name = 'Software Engineering')),
((SELECT id FROM papers WHERE title LIKE '%Software Development%'), (SELECT id FROM categories WHERE name = 'Computer Science')),

-- Paper 8 categories
((SELECT id FROM papers WHERE title LIKE '%Cognitive Processes%'), (SELECT id FROM categories WHERE name = 'Neuroscience')),
((SELECT id FROM papers WHERE title LIKE '%Cognitive Processes%'), (SELECT id FROM categories WHERE name = 'Biology'));

-- Print confirmation (this will show in logs)
SELECT 'Mock data insertion completed successfully!' as status;
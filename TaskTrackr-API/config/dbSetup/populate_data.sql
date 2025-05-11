INSERT INTO priority (priority_id, text) VALUES (1, 'Low');
INSERT INTO priority (priority_id, text) VALUES (2, 'Medium');
INSERT INTO priority (priority_id, text) VALUES (3, 'High');
INSERT INTO priority (priority_id, text) VALUES (4, 'Critical');
INSERT INTO status (status_id, name) VALUES (1, 'Not Started');
INSERT INTO status (status_id, name) VALUES (2, 'Started');
INSERT INTO status (status_id, name) VALUES (3, 'Complete');
INSERT INTO status (status_id, name) VALUES (4, 'Archived');
INSERT INTO webhook_destination (webhook_destination_id, name, format) VALUES (1, 'Discord', '{"content":"message"}');
create table webhook_destination
(
    webhook_destination_id int auto_increment
        primary key,
    name                   varchar(255) not null,
    format                 text         not null
);
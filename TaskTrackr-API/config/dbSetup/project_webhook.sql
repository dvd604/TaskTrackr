create table project_webhook
(
    project_webhook_id     int auto_increment
        primary key,
    project_id             int  not null,
    webhook_destination_id int  not null,
    webhook_location       text not null,
    constraint fk_project_webhook_project_id_project_project_id
        foreign key (project_id) references `project` (project_id),
    constraint fk_webhook_destination_id_webhook_destination
        foreign key (webhook_destination_id) references `webhook_destination` (webhook_destination_id)
);


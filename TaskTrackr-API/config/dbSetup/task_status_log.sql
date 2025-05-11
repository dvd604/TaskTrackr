create table task_status_log
(
    task_status_id int auto_increment
        primary key,
    task_id        int not null,
    user_id        int not null,
    status_id      int not null,
    time           int not null,
    constraint fk_task_status_log_task_id_task_task_id
        foreign key (task_id) references task (task_id),
    constraint fk_task_status_log_user_id
        foreign key (user_Id) references user (user_id),
    constraint fk_task_status_log_status_id
        foreign key (status_id) references status (status_id)
);


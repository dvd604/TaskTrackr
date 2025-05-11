create table task
(
    task_id     int auto_increment
        primary key,
    name        varchar(255) not null,
    `desc`      text         null,
    project_id  int          null,
    user_id     int          not null,
    guid        varchar(255) not null,
    create_time int          not null,
    status_id   int          not null default 1,
    assigned_user_id int     not null,
    due_date    int          not null,
    priority_id int          not null default 1,
    constraint fk_task_project_id_project_project_id
        foreign key (project_id) references project (project_id),
    constraint fk_task_user_id_user_user_id
        foreign key (user_id) references user (user_id),
    constraint fK_task_status_id_status_status_id
        foreign key (status_id) references status (status_id),
    constraint fK_tasK_assigned_user_id_user_user_id
        foreign key (assigned_user_id) references user(user_id),
    constraint fk_task_priority_id_priority_priority_id
        foreign key (priority_id) references priority(priority_id)
);
create table user_project
(
    user_id    int not null,
    project_id int not null,
    primary key (user_id, project_id)
);

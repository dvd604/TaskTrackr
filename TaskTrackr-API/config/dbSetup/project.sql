create table project
(
    project_id  int auto_increment
        primary key,
    owner_id    int          not null,
    name        varchar(255) not null,
    create_time int          not null,
    guid        varchar(255) not null,
    constraint fk_project_owner_id_user_user_id
        foreign key (owner_id) references user (user_id)
);
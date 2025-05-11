create table project_invite
(
    project_invite_id int auto_increment
        primary key,
    project_id        int          not null,
    invite_key        varchar(255) not null,
    constraint fk_project_invite_project_id_project_project_id
        foreign key (project_id) references project (project_id)
);


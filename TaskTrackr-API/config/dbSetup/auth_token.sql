create table auth_token
(
    auth_token_id int auto_increment
        primary key,
    user_id       int          not null,
    token         text         not null,
    name          varchar(255) not null,
    create_time   int          not null,
    constraint fk_auth_token_user_id_user_user_id
        foreign key (user_id) references user (user_id)
);


create table user
(
    user_id     int auto_increment
        primary key,
    name        text         not null,
    username    varchar(255) not null unique,
    email       varchar(255) not null unique,
    password    text         not null,
    create_time int     not null,
    guid        varchar(255) not null,
    otp_secret  varchar(255) default null
);

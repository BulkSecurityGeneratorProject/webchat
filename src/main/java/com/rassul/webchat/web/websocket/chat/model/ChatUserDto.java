package com.rassul.webchat.web.websocket.chat.model;


import com.fasterxml.jackson.annotation.JsonIgnore;

public class ChatUserDto {
    private String username;

    private int amount = 1;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonIgnore
    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    @Override
    public boolean equals(Object obj) {
        ChatUserDto castedObj = (ChatUserDto) obj;
        if(castedObj.getUsername().equals(this.username)){
            return true;
        }
        return false;
    }

    @Override
    public int hashCode() {
        return username.hashCode();
    }
}

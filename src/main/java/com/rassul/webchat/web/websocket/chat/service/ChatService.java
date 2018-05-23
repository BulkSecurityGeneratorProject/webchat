package com.rassul.webchat.web.websocket.chat.service;

import com.rassul.webchat.web.websocket.chat.model.ChatUserDto;
import com.rassul.webchat.web.websocket.chat.model.MessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.function.Consumer;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private final SimpMessageSendingOperations messagingTemplate;

    public ChatService(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        this.chatUserDtos = Collections.synchronizedSet(new HashSet<ChatUserDto>());
    }

    private Set<ChatUserDto> chatUserDtos;

    public boolean joinChat(ChatUserDto chatUserDto){
        if(chatUserDtos.contains(chatUserDto)){
            chatUserDtos.forEach(new Consumer<ChatUserDto>() {
                @Override
                public void accept(ChatUserDto cU) {
                    if(cU.equals(chatUserDto)){
                        cU.setAmount(cU.getAmount()+1);
                    }
                }
            });
            return true;
        }
        boolean added = chatUserDtos.add(chatUserDto);
        publishOnlineUsers();
        return added;
    }

    public boolean leaveChat(ChatUserDto chatUserDto){
        final boolean[] amountDecreased = {false};
        if(chatUserDtos.contains(chatUserDto)){
            chatUserDtos.forEach(cU -> {
                if(cU.equals(chatUserDto) && (cU.getAmount() > 1)){
                    cU.setAmount(cU.getAmount()-1);
                    amountDecreased[0] = true;
                }
            });
        }
        if(amountDecreased[0]){
            return false;
        }
        boolean removed = chatUserDtos.remove(chatUserDto);
        publishOnlineUsers();
        return removed;
    }

    public Set<ChatUserDto> getOnlineUsers(){
        return chatUserDtos;
    }

    public void publishOnlineUsers(){
        messagingTemplate.convertAndSend( "/ws/chat", chatUserDtos);
    }

    public void sendMessageToUser(String fromUser, String toUser, String payload){
        ChatUserDto chatUserDto = new ChatUserDto();
        chatUserDto.setUsername(toUser);
        if(!this.chatUserDtos.contains(chatUserDto)){
            return;
        }
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setFrom(fromUser);
        messageDTO.setPayload(payload);
        messagingTemplate.convertAndSendToUser(toUser, "ws/chat", messageDTO);
    }
}

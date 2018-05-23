package com.rassul.webchat.web.websocket.chat.controller;

import com.rassul.webchat.web.websocket.ActivityService;
import com.rassul.webchat.web.websocket.chat.model.ChatUserDto;
import com.rassul.webchat.web.websocket.chat.service.ChatService;
import com.rassul.webchat.web.websocket.chat.model.MessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.AbstractSubProtocolEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Arrays;
import java.util.Set;

@Controller
public class ChatController implements ApplicationListener<AbstractSubProtocolEvent>{

    private static final Logger log = LoggerFactory.getLogger(ActivityService.class);

    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;

    public ChatController(SimpMessageSendingOperations messagingTemplate, ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @SubscribeMapping("/ws/sendmessage")
    @SendTo("/ws/chat")
    public MessageDTO sendMessage(@Payload MessageDTO messageDTO,
                                  StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        messageDTO.setFrom(principal.getName());
        log.debug("Sending chat message {}", messageDTO);
        return messageDTO;
    }

    @MessageMapping("/ws/sendmessagetouser")
    public MessageDTO sendMessageToUser(@Payload MessageDTO messageDTO,
                                  StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        log.debug("Sending private chat message {}", messageDTO);
        if(principal.getName().equals(messageDTO.getToUser())){
            return null;
        }
        chatService.sendMessageToUser(principal.getName(), messageDTO.getToUser(), messageDTO.getPayload());
        return messageDTO;
    }

    @SubscribeMapping("/user/ws/chat")
    public void subscriptionEvent(StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        log.debug("Subsription to /user/ws/chat {}", principal);
        Set<ChatUserDto> chatUserDtos = chatService.getOnlineUsers();
        messagingTemplate.convertAndSendToUser(principal.getName(), "/ws/chat", chatUserDtos);
    }


    @MessageMapping("/ws/onlineusers")
    public Set<ChatUserDto> getOnlineUsers(
        StompHeaderAccessor stompHeaderAccessor,
        Principal principal
    ) {
        Set<ChatUserDto> chatUserDtos = chatService.getOnlineUsers();
        log.debug("Retrieving onlinechat users {}", Arrays.toString(chatUserDtos.toArray()));
        log.debug("Retrieving onlinechat size " + chatUserDtos.size());

        messagingTemplate.convertAndSendToUser(principal.getName(), "/ws/chat", chatUserDtos);
        return chatUserDtos;
    }


    @Override
    public void onApplicationEvent(AbstractSubProtocolEvent event) {

        if(event.getClass().equals(SessionDisconnectEvent.class)){
            log.debug("ChatWebsocket disconnected {}", event);
            ChatUserDto chatUserDto = new ChatUserDto();
            chatUserDto.setUsername(event.getUser().getName());
            boolean leaved = chatService.leaveChat(chatUserDto);
            log.debug("Leaved {}", leaved);
        }

        if(event.getClass().equals(SessionConnectedEvent.class)){
            log.debug("ChatWebsocket connected {}", event);
            ChatUserDto chatUserDto = new ChatUserDto();
            chatUserDto.setUsername(event.getUser().getName());
            chatService.joinChat(chatUserDto);
        }
    }
}

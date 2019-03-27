package com.troila.cloud.microservice.user.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.troila.cloud.microservice.user.dto.LoadUserReply;
import com.troila.cloud.microservice.user.dto.LoadUserRequest;

@RestController
@CrossOrigin
@RequestMapping(path="/pb")
public class ProtoWebController {
	
	@PostMapping("/user")
	public LoadUserReply test1(@RequestBody LoadUserRequest req) {
		System.out.println(req.getUsername());
		
		LoadUserReply.Builder builder = LoadUserReply.newBuilder();
		builder.setAuthId(1);
		builder.setEmail("admin@troila.com");
		builder.setId(101);
		builder.setName("admin");
		builder.setNick("张三");
		builder.setTelephone("13822211012");
		return builder.build();
	}
	
	@GetMapping("/unauth")
	public void test401(HttpServletRequest req,HttpServletResponse resp) {
		resp.setStatus(HttpStatus.UNAUTHORIZED.value());
	}
}

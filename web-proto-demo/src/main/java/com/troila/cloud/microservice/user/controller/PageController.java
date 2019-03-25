package com.troila.cloud.microservice.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/page")
public class PageController {
	
	@GetMapping("/test")
	public String p1() {
		return "test";
	}
	@GetMapping("/test2")
	public String p2() {
		return "test2";
	}
}

package com.troila.cloud.microservice.user.config;

import java.util.List;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebHttpMsgConvertorConfig implements WebMvcConfigurer {

	@Override
	public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
		converters.add(createProtobufHttpMessageConverter());
	}

	private ProtobufHttpMessageConverter createProtobufHttpMessageConverter() {
		return new ProtobufHttpMessageConverter();
	}
}

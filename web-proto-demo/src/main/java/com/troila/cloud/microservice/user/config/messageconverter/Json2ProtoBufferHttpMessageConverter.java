package com.troila.cloud.microservice.user.config.messageconverter;

import static org.springframework.http.MediaType.TEXT_PLAIN;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConversionException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.util.Assert;
import org.springframework.util.ConcurrentReferenceHashMap;

import com.google.protobuf.CodedOutputStream;
import com.google.protobuf.ExtensionRegistry;
import com.google.protobuf.Message;
import com.google.protobuf.TextFormat;
import com.google.protobuf.util.JsonFormat;

/**
 * 该组件实现从页面发来的json转换成protobuf类型，在返回的时候从protobuffer类型转换成
 * json类型
 * @author haodonglei
 */
public class Json2ProtoBufferHttpMessageConverter extends AbstractHttpMessageConverter<Message>{

	//定义默认编码类型
	public static final Charset DEFAULT_CHARSET = StandardCharsets.UTF_8;
	
	//定义一个mediaType application/x-protobuf-json
	public static final MediaType PROTOBUF_JSON = new MediaType("application", "x-protobuf-json", DEFAULT_CHARSET);
	
	public static final String X_PROTOBUF_SCHEMA_HEADER = "X-Protobuf-Schema";
	
	public static final String X_PROTOBUF_MESSAGE_HEADER = "X-Protobuf-Message";

	private static final Map<Class<?>, Method> methodCache = new ConcurrentReferenceHashMap<>();
	
	final ExtensionRegistry extensionRegistry;
	/**
	 * 只对protobuffer message类型生效
	 */
	@Override
	protected boolean supports(Class<?> clazz) {
		return Message.class.isAssignableFrom(clazz);
	}

	
	
	@Override
	protected boolean canRead(MediaType mediaType) {
		return mediaType.equals(PROTOBUF_JSON);
	}
	
	@Override
	protected boolean canWrite(MediaType mediaType) {
		return super.canWrite(mediaType) || mediaType.equals(PROTOBUF_JSON) ;
	}



	public Json2ProtoBufferHttpMessageConverter() {
		this(null);
	}
	
	public Json2ProtoBufferHttpMessageConverter(ExtensionRegistry extensionRegistry) {
		this.setSupportedMediaTypes(Arrays.asList(new MediaType[]{PROTOBUF_JSON}));
		this.extensionRegistry = (extensionRegistry == null ? ExtensionRegistry.newInstance() : extensionRegistry);
	}



	@Override
	protected Message readInternal(Class<? extends Message> clazz, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {
		
		MediaType contentType = inputMessage.getHeaders().getContentType();
		if (contentType == null) {
			contentType = PROTOBUF_JSON;
		}
		Charset charset = contentType.getCharset();
		if (charset == null) {
			charset = DEFAULT_CHARSET;
		}

		Message.Builder builder = getMessageBuilder(clazz);
		if (PROTOBUF_JSON.isCompatibleWith(contentType)) {
			Reader reader = new InputStreamReader(inputMessage.getBody());
			JsonFormat.parser().merge(reader, builder);
		}
		return builder.build();
	}

	@Override
	protected void writeInternal(Message message, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {
		MediaType contentType = outputMessage.getHeaders().getContentType();
		if (contentType == null) {
			contentType = getDefaultContentType(message);
			Assert.state(contentType != null, "No content type");
		}
		Charset charset = contentType.getCharset();
		if (charset == null) {
			charset = DEFAULT_CHARSET;
		}
		if (PROTOBUF_JSON.isCompatibleWith(contentType)) {
			setProtoHeader(outputMessage, message);
			String jsonMessage = JsonFormat.printer().print(message);
			outputMessage.getBody().write(jsonMessage.getBytes(DEFAULT_CHARSET));
		}
		else if (TEXT_PLAIN.isCompatibleWith(contentType)) {
			OutputStreamWriter outputStreamWriter = new OutputStreamWriter(outputMessage.getBody(), charset);
			TextFormat.print(message, outputStreamWriter);
			outputStreamWriter.flush();
			outputMessage.getBody().flush();
		}else {
			setProtoHeader(outputMessage, message);
			CodedOutputStream codedOutputStream = CodedOutputStream.newInstance(outputMessage.getBody());
			message.writeTo(codedOutputStream);
			codedOutputStream.flush();
		}
	}

	private Message.Builder getMessageBuilder(Class<? extends Message> clazz) {
		try {
			Method method = methodCache.get(clazz);
			if (method == null) {
				method = clazz.getMethod("newBuilder");
				methodCache.put(clazz, method);
			}
			return (Message.Builder) method.invoke(clazz);
		}
		catch (Exception ex) {
			throw new HttpMessageConversionException(
					"Invalid Protobuf Message type: no invocable newBuilder() method on " + clazz, ex);
		}
	}
	private void setProtoHeader(HttpOutputMessage response, Message message) {
		response.getHeaders().set(X_PROTOBUF_SCHEMA_HEADER, message.getDescriptorForType().getFile().getName());
		response.getHeaders().set(X_PROTOBUF_MESSAGE_HEADER, message.getDescriptorForType().getFullName());
	}
}

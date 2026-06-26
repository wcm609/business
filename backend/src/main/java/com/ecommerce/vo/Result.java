package com.ecommerce.vo;

import lombok.Data;

@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    /**
     * 操作成功，返回数据，默认消息 "成功"
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("成功");
        result.setData(data);
        return result;
    }

    /**
     * 操作成功，返回数据和自定义消息
     */
    public static <T> Result<T> success(T data, String message) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    /**
     * 操作成功，无返回数据，默认消息 "成功"
     */
    public static Result<Void> ok() {
        Result<Void> result = new Result<>();
        result.setCode(200);
        result.setMessage("成功");
        return result;
    }

    /**
     * 操作成功，无返回数据，自定义消息
     */
    public static Result<Void> ok(String message) {
        Result<Void> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        return result;
    }

    /**
     * 操作失败
     */
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }
}

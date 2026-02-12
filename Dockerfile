# 使用 Nginx 作为基础镜像
FROM registry.cn-hangzhou.aliyuncs.com/veryou/nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 删除默认的 Nginx 页面
# RUN rm -rf /usr/share/nginx/html/*

# 复制网站文件到容器中
COPY . .

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]

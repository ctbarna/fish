function fish_final()

xlim([0 100]);
ylim([0 100]);

M=5000;
N=50;
P=0;

alpha = 10;
beta = 100;
cr = 20;
ca = 5;
lr = 20;
la = 60;
lc = 2;
fx = 0;
fy = 0;
dt =.2;

x=zeros(N+P,M);
y=zeros(N+P,M);

x(:,1)=50*rand(N+P,1)+25;
y(:,1)=50*rand(N+P,1)+25;

vx=zeros(N+P,M);
vy=zeros(N+P,M);

vx(:,1)=.5*randn(N+P,1);
vy(:,1)=.5*randn(N+P,1);

ax=zeros(N+P,M);
ay=zeros(N+P,M);

ax(:,1)=.001*randn(N+P,1);
ay(:,1)=.001*randn(N+P,1);

i=1;

plot(x(1:N,i),y(1:N,i),'bo');
axis([0 100 0 100]);
drawnow;

for i=2:M
  for j=1:N+P
    vx(j,i)=vx(j,i-1)+dt*ax(j,i-1)+.00001*randn();
    vy(j,i)=vy(j,i-1)+dt*ay(j,i-1)+.00001*randn();
    x(j,i)=x(j,i-1)+dt*vx(j,i-1);
    y(j,i)=y(j,i-1)+dt*vy(j,i-1);

    if(x(j,i)>100)
      x(j,i)=x(j,i)-100;
    else
    end

    if(x(j,i)<0)
      x(j,i)=x(j,i)+100;
    else
    end

    if(y(j,i)>100)
      y(j,i)=y(j,i)-100;
    else
    end

    if(y(j,i)<0)
      y(j,i)=y(j,i)+100;
    else
    end
  end

  for k=1:N+P
    for l=1:N+P
      if(k ~= l)
        ax(k,i)=ax(k,i)+...
          cr*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/lr)...
          *(-1/(2*lr))*((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)^(-1/2)...
          *(2*(x(k,i)-x(l,i)))-...
          ca*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/la)...
          *(-1/(2*la))*((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)^(-1/2)...
          *(2*(x(k,i)-x(l,i)));

        fx=fx+vx(l,i)*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/lc);

        ay(k,i)=ay(k,i)+...
          cr*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/lr)...
          *(-1/(2*lr))*((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)^(-1/2)...
          *(2*(y(k,i)-y(l,i)))-...
          ca*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/la)...
          *(-1/(2*la))*((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)^(-1/2)...
          *(2*(y(k,i)-y(l,i)));

        fy=fy+vy(l,i)*exp(-(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2))/lc);
      else
      end
    end

    ax(k,i)=(alpha-beta*(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)))*vx(k,i)-ax(k,i)
    ay(k,i)=(alpha-beta*(sqrt((x(k,i)-x(l,i))^2+(y(k,i)-y(l,i))^2)))*vy(k,i)-ay(k,i)
    fx = 0;
    fy = 0;
  end

  plot(x(1:N,i),y(1:N,i),'bo',x(N+1:N+P),y(N+1:N+P),'rx');
  axis([0 100 0 100]);
  drawnow;
end

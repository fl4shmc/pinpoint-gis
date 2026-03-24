FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["PinpointGis.Api.csproj", "./"]
RUN dotnet restore "PinpointGis.Api.csproj"

COPY . .
RUN dotnet publish "PinpointGis.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "PinpointGis.Api.dll"]

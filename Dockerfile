FROM mcr.microsoft.com/dotnet/core/sdk:2.2

# install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash

# set env
ENV NVM_DIR=/root/.nvm

# install node
RUN bash -c "source $NVM_DIR/nvm.sh && nvm install 8"

COPY RNAqbase /RNAqbase

WORKDIR /RNAqbase

RUN bash -c "source $NVM_DIR/nvm.sh && dotnet publish -c Release"

CMD ["bash", "-c", "source $NVM_DIR/nvm.sh && dotnet bin/Release/netcoreapp2.2/RNAqbase.dll"]

EXPOSE 80

#ENV ASPNETCORE_ENVIRONMENT=Development

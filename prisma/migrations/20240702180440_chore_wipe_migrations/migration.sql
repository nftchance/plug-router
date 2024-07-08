-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plugs" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER[],
    "socket" TEXT NOT NULL,
    "actions" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "fee" INTEGER NOT NULL,

    CONSTRAINT "Plugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LivePlugs" (
    "id" TEXT NOT NULL,
    "plugsId" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "socketUserAddress" TEXT NOT NULL,
    "socketAddress" TEXT NOT NULL,

    CONSTRAINT "LivePlugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "simulation" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "plugsId" TEXT,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_apiKey_key" ON "Client"("apiKey");

-- AddForeignKey
ALTER TABLE "LivePlugs" ADD CONSTRAINT "LivePlugs_plugsId_fkey" FOREIGN KEY ("plugsId") REFERENCES "Plugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_plugsId_fkey" FOREIGN KEY ("plugsId") REFERENCES "Plugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

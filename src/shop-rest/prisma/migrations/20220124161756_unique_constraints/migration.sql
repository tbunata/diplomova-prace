/*
  Warnings:

  - A unique constraint covering the columns `[productId,cartId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,categoryId]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItem_productId_cartId_key" ON "CartItem"("productId", "cartId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_productId_categoryId_key" ON "ProductCategory"("productId", "categoryId");

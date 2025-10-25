#!/bin/bash

# Walrus On-Chain LinkTree Kurulum Betiği

echo "🌳 Walrus On-Chain LinkTree Kurulum Başlatılıyor..."
echo ""

# 1. Move sözleşmesini kontrol et
echo "📦 Move sözleşmesi kontrol ediliyor..."
if [ ! -f "move/Move.toml" ]; then
    echo "❌ Move.toml bulunamadı. Move klasöründe misiniz?"
    exit 1
fi

# 2. Node.js'i kontrol et
echo "🔍 Node.js sürümü kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js yüklü değil. Lütfen Node.js 18+ yükleyin."
    exit 1
fi
echo "✅ Node.js $(node --version) bulundu"

# 3. npm bağımlılıklarını yükle
echo ""
echo "📥 Frontend bağımlılıkları yükleniyor..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend bağımlılıkları yüklendi"
else
    echo "❌ Frontend bağımlılıkları yüklenirken hata oluştu"
    exit 1
fi
cd ..

# 4. Build kontrolü
echo ""
echo "🏗️  Frontend build kontrol ediliyor..."
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend başarıyla build edildi"
else
    echo "❌ Frontend build başarısız"
    exit 1
fi
cd ..

echo ""
echo "🎉 Kurulum başarıyla tamamlandı!"
echo ""
echo "Sonraki adımlar:"
echo "1. Move sözleşmesini deploy edin: cd move && sui client publish"
echo "2. Package ID'sini frontend'e ekleyin"
echo "3. Frontend'i çalıştırın: cd frontend && npm run dev"
echo "4. Walrus'a deploy edin: site-builder deploy ./frontend/dist"
echo ""
echo "Ayrıntılı bilgi için SETUP.md dosyasını okuyun."

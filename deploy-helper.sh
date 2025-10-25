#!/bin/bash

echo "🦭 Walrus Sites Deployment Helper"
echo ""
echo "Build hazır: frontend/dist/"
echo ""

# Dist dosyalarını listele
echo "📦 Deploy edilecek dosyalar:"
cd frontend/dist
find . -type f
cd ../..

echo ""
echo "📝 Deployment seçenekleri:"
echo ""
echo "1. Web Portal (Önerilen):"
echo "   https://publisher.walrus-testnet.walrus.space/"
echo "   veya"
echo "   https://walrus-testnet-publisher.staketab.org/"
echo ""
echo "2. Bu dosyaları yükle:"
echo "   - Tüm dosyaları seç (Ctrl+A ile frontend/dist içinde)"
echo "   - Epoch: 1"
echo "   - Publish tıkla"
echo ""
echo "3. Site URL'i not al:"
echo "   https://[SITE_ID].walrus.site/"
echo ""
echo "💡 Not: Eğer portallar açılmıyorsa, VPN kullanmayı dene."

rm -rf ~/projetos/diogo/simple-node-bootstrap/logs/*.log*;
cd ~/projetos/diogo
tar --exclude='package-lock.json' --exclude='.git' --exclude='snf.tar.gz' --exclude='.nyc_output' --exclude='node_modules' -zcvf create-snf-app/packages/snf.tar.gz simple-node-bootstrap
cd ~/projetos/diogo/create-snf-app
git add packages/snf.tar.gz
git commit -m "Updating the snf package"
git push origin master
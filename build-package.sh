rm -rf ~/projetos/diogo/simple-node-bootstrap/logs/*.log*;
cd ~/projetos/diogo
rm -rf create-snf-app/packages/snf.zip
cd ~/projetos/diogo/simple-node-bootstrap
zip -r -x='*package-lock.json' -x='*.git/*' -x='*snf.zip' -x='*.nyc_output' -x='*node_modules/*' snf.zip .
mv snf.zip ../create-snf-app/packages/snf.zip
cd ~/projetos/diogo/create-snf-app
git add packages/snf.zip
git commit -m "Updating the snf package"
git push origin master
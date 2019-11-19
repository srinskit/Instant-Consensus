declare -a arr=(
"./main.js run one   14eb5f76c462c59970d3e4f8ece1a9b289a5100c9c767bfa7854ca8c812f5b2e"
"./main.js run two   4031c4ba864aab531866ea6386ae40f2810624b8a4b0689bf7ebdbcef1d6ba61"
"./main.js run three 8205f304253498a307c028df7f65233c63853e42cf37f125327a553cfc785941"
"./main.js run four  cc597bda339d0f949f78469b50d82137cf1f252b5f96dc82e8c88c85bf360c7f"
"./main.js run five  fd25073bc047f7accc56b0154adf12f559b0fdfbe2aad4fe09df697110ff2f76"
"./main.js run six   a1ad40afb6a0dd56445aef72ce7239ea7360cb4530f7e862e31f03866abff067"
"./main.js run seven 6f2b4fd57380864a2bb6db00918a7cc0b40d26f52b06940e9524694718c14562"
"./main.js run eight 21acba8a57f7bb08886e62ffee09be695fc67e86b7f727fe4921fea84e9d2331"
)   

for i in "${arr[@]}"
do
   gnome-terminal -- zsh -c "$i; zsh"
   sleep 1
done
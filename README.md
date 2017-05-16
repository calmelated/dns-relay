# dns-relay
dns-relay is a debug tool. It pretends itself a DNS server and reply requests with pre-defined IP address.  

# Installation
 - `git clone` this project
 - `npm install` to install the required modules
 
# Configurations of `dnsd.conf`
 - `relay_server` the real DNS server to get the IP record
 - `match_rules` add/change rules to fit your needs

# Usage
 - `npm start` will start dns-relay and listen on 0.0.0.0 port 53
 - Make sure your PC/Mobile use `dns-relay` to resolve their DNS requests.

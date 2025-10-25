#!/bin/bash
cd /var/www/mcpfinder-frontend
exec npx serve -s build -p 3000

def register_commands(bot):
    
    @bot.message_handler(commands=['commands'])
    def list_commands(message):
        text = "<b>List of all Commands:</b>\n/" \
        "start - Start the bot\n" \
        "/game - Explanation of a specific game\n" \
        "/help - Support & Info\n" \
        "/open_source - GitHub link\n" \
        "/donate - Support us"
        bot.send_message(message.chat.id, text, parse_mode="HTML")


    @bot.message_handler(commands=['help'])
    def help_command(message):
        text = (
            "If you need a direct support ticket, type /support.\n"
            "If you don't understand a game, type /game and choose the game you need an explanation for."
        )
        bot.send_message(message.chat.id, text)


    @bot.message_handler(commands=['support'])
    def support_command(message):
        bot.send_message(message.chat.id, "Write a message at t.me/stk_22_05")


    @bot.message_handler(commands=['codebreaker', 'gomoku', 'number_memory', 'snake'])
    def game_explanation(message):
        cmd = message.text.split()[0].replace("/", "")
        explanations = {
            "codebreaker": 
            "In Codebreaker, you must guess the hidden color sequence...",

            "gomoku": "Gomoku is like Tic-Tac-Toe but on a larger board. Connect 5!",

            "number_memory": "Memorize the longest number possible.",

            "snake": "Control a snake to eat food and grow longer."
        }
        bot.send_message(message.chat.id, explanations.get(cmd, "No explanation found."))


    @bot.message_handler(commands=['open_source'])
    def open_source(message):
        bot.send_message(message.chat.id, "Check our code on GitHub: https://github.com/stkirchberg/telegram_mini-game-bots")

    @bot.message_handler(commands=['donate'])
    def donate(message):
        bot.send_message(message.chat.id, "Support us via PayPal or Telegram Wallet: [Link einfügen]")
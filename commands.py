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
            "codebreaker": (
                "<b>🎮 Color Codebreaker: The Complete Guide</b>\n\n"
                "<b>The Objective:</b>\n"
                "The computer generates a secret code of 5 slots using a variety of colors. "
                "Your mission is to guess the exact colors and their positions in as few attempts as possible.\n\n"
                
                "<b>How to Control:</b>\n"
                "• <b>Selecting:</b> Tap a color in the Palette (top row) to place it in your current guess.\n"
                "• <b>Correcting:</b> Click a color inside your 'Current Row' to remove it if you made a mistake.\n"
                "• <b>Checking:</b> Once all 5 slots are filled, press the 'Check' button.\n"
                "• <b>Theme:</b> Use the ☀︎/☾ button to switch between light and dark mode.\n\n"
                
                "<b>Understanding the Feedback (Clues):</b>\n"
                "After each check, you will see square emojis:\n"
                "• 🟩 <b>Green:</b> Correct color in the correct position.\n"
                "• 🟨 <b>Yellow:</b> The color exists in the code, but is in the wrong position.\n"
                "• ⬛ <b>Black:</b> This color is not part of the secret code at all.\n\n"
                
                "<b>Rules:</b>\n"
                "• Colors can appear multiple times in the same code.\n"
                "• There is no time limit—use logic to win!"
            ),

            "gomoku": "<b>Gomoku:</b>\nA strategic board game where you and the computer take turns. Connect 5 of your symbols in a row (horizontally, vertically, or diagonally) to win!",

            "number_memory": "<b>Number Memory:</b>\nTest your short-term memory! A number will flash briefly on the screen. Type it back correctly to advance to the next level. The numbers get longer every time!",

            "snake": "<b>Snake:</b>\nThe classic arcade game. Navigate the snake to eat food and grow. Don't hit the walls or yourself!"
        }


        bot.send_message(
            message.chat.id, 
            explanations.get(cmd, "No explanation found."), 
            parse_mode="HTML"
        )


    @bot.message_handler(commands=['open_source'])
    def open_source(message):
        bot.send_message(message.chat.id, "Check our code on GitHub: https://github.com/stkirchberg/telegram_mini-game-bots")

    @bot.message_handler(commands=['donate'])
    def donate(message):
        bot.send_message(message.chat.id, "Support us via Telegram Wallet: https://t.me/wallet?start=stk_22_05")
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
                "<b>🎮 Codebreaker: The Complete Guide</b>\n\n"
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

            "gomoku": (
                "<b>🎮 Gomoku (Five in a Row): The Complete Guide</b>\n\n"
                "<b>The Objective:</b>\n"
                "Gomoku is a classic strategy board game. Your goal is to be the first to place <b>five stones in an unbroken row</b> horizontally, vertically, or diagonally.\n\n"
                
                "<b>How to Control:</b>\n"
                "• <b>Placing Stones:</b> Simply tap or click on any empty intersection on the grid to place your green stone.\n"
                "• <b>Moving the Board:</b> You can drag the board to navigate if you are zoomed in.\n"
                "• <b>Zooming:</b> Use the <b>+</b> and <b>−</b> buttons at the bottom right, or use your mouse wheel to get a better view of the action.\n"
                "• <b>New Game:</b> Press the 'New Game' button in the header to reset the board at any time.\n"
                "• <b>Theme:</b> Switch between Light and Dark mode using the ☀︎/☾ button.\n\n"
                
                "<b>Game Rules:</b>\n"
                "• 🟢 <b>You:</b> You play with green stones and always start first.\n"
                "• 🔵 <b>Computer:</b> The AI plays with blue stones and will react to your moves.\n"
                "• <b>Winning:</b> The first to get 5 in a row wins. A golden highlight will show the winning line.\n\n"
                
                "<b>Strategy Tip:</b>\n"
                "Don't just focus on your own line! Watch the computer closely. If it gets three or four stones in a row, you must block it immediately, or you will lose."
            ),

            "number_memory": (
                "<b>🎮 Number Memory: The Complete Guide</b>\n\n"
                "<b>The Objective:</b>\n"
                "Test the limits of your short-term memory! The game will show you a sequence of numbers that you must memorize and repeat perfectly. With every correct answer, the sequence grows longer.\n\n"
                
                "<b>How to Play:</b>\n"
                "• <b>The Sequence:</b> When you press <b>'Start'</b>, a sequence (starting with 3 digits) will appear in the display.\n"
                "• <b>Memorize:</b> You have a short window of time to memorize the numbers before they disappear and the display says 'Your turn'.\n"
                "• <b>Input:</b> Use the on-screen keypad (0-9) to type the numbers you just saw.\n"
                "• <b>Correction:</b> If you mistype a digit, use the <b>'*' (Delete)</b> key to remove the last number.\n"
                "• <b>Submit:</b> Once you have entered the full sequence, press the <b>'#' (Enter)</b> key to check your answer.\n\n"
                
                "<b>Game Rules:</b>\n"
                "• <b>Progression:</b> If your input is 100% correct, the game adds one new random digit to the sequence and shows it again.\n"
                "• <b>Game Over:</b> If you make even one mistake, the game ends. The display will show your final score (the length of the last successful sequence).\n\n"
                
                "<b>Tips:</b>\n"
                "• Try to group the numbers into 'chunks' (e.g., instead of 1-5-9, remember it as 159).\n"
                "• Use the ☀︎/☾ button to switch to Dark Mode if the bright screen is distracting you!"
            ),

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
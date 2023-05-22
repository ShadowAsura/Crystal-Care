<script>
  let message_content;

  function send() {
    //fetch()
    //message_content
  }
</script>

<div>
  <h2>Reply</h2>
  <textarea bind:value={message_content}></textarea>
  <input type="button" value="Send" on:click={send}/>
</div>

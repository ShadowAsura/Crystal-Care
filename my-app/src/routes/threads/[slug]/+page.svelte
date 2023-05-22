<script>
  import Message from '$lib/components/Message.svelte';
  import MessageReply from '$lib/components/MessageReply.svelte';

  //messages given from +page.js?
  //placeholder
  let messages = [];
  let thread_name = "placeholder";
</script>

<div>
  <h1>Messages: {thread_name}</h1>
  <div>
    {#each messages as message}
      <Message {...message}/>
    {/each}
  </div>
  <MessageReply/>
</div>

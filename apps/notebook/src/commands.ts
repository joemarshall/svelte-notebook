/**
 * Set up keyboard shortcuts & commands for notebook
 */
import { CommandRegistry } from '@lumino/commands';
import { sessionContextDialogs } from '@jupyterlab/apputils';
import { CompletionHandler } from '@jupyterlab/completer';
import { NotebookActions, NotebookPanel } from '@jupyterlab/notebook';
import { ServiceManager } from '@jupyterlab/services';
import { NotebookSearchProvider, SearchInstance } from '@jupyterlab/documentsearch';

import { stopIcon, runIcon, fastForwardIcon, refreshIcon } from '@jupyterlab/ui-components';

import { Toolbar, CommandToolbarButton } from '@jupyterlab/apputils';

/**
 * The map of command ids used by the notebook.
 */
const cmdIds = {
  invoke: 'completer:invoke',
  select: 'completer:select',
  invokeNotebook: 'completer:invoke-notebook',
  selectNotebook: 'completer:select-notebook',
  startSearch: 'documentsearch:start-search',
  findNext: 'documentsearch:find-next',
  findPrevious: 'documentsearch:find-previous',
  revert: 'docmanager:reload',
  interrupt: 'notebook:interrupt-kernel',
  restart: 'notebook:restart-kernel',
  switchKernel: 'notebook:switch-kernel',
  runAndAdvance: 'notebook-cells:run-and-advance',
  run: 'notebook:run-cell',
  runAll: 'notebook:run-all',
  deleteCell: 'notebook-cells:delete',
  selectAbove: 'notebook-cells:select-above',
  selectBelow: 'notebook-cells:select-below',
  extendAbove: 'notebook-cells:extend-above',
  extendTop: 'notebook-cells:extend-top',
  extendBelow: 'notebook-cells:extend-below',
  extendBottom: 'notebook-cells:extend-bottom',
  editMode: 'notebook:edit-mode',
  merge: 'notebook-cells:merge',
  split: 'notebook-cells:split',
  commandMode: 'notebook:command-mode',
  undo: 'notebook-cells:undo',
  redo: 'notebook-cells:redo'
};

export const SetupCommands = (
  commands: CommandRegistry,
  toolbar: Toolbar,
  nbWidget: NotebookPanel,
  handler: CompletionHandler,
  serviceManager: ServiceManager,
  revertContents: any,
  revertPath: string
) => {
  // Add commands.
  commands.addCommand(cmdIds.invoke, {
    label: 'Completer: Invoke',
    execute: () => handler.invoke()
  });

  commands.addCommand(cmdIds.select, {
    label: 'Completer: Select',
    execute: () => handler.completer.selectActive()
  });

  commands.addCommand(cmdIds.invokeNotebook, {
    label: 'Invoke Notebook',
    execute: () => {
      if (nbWidget.content.activeCell?.model.type === 'code') {
        return commands.execute(cmdIds.invoke);
      }
    }
  });

  commands.addCommand(cmdIds.selectNotebook, {
    label: 'Select Notebook',
    execute: () => {
      if (nbWidget.content.activeCell?.model.type === 'code') {
        return commands.execute(cmdIds.select);
      }
    }
  });

  let searchInstance: SearchInstance | undefined;
  commands.addCommand(cmdIds.startSearch, {
    label: 'Find…',
    execute: () => {
      if (searchInstance) {
        searchInstance.focusInput();
        return;
      }
      const provider = new NotebookSearchProvider();
      searchInstance = new SearchInstance(nbWidget, provider);
      searchInstance.disposed.connect(() => {
        searchInstance = undefined;
        // find next and previous are now not enabled
        commands.notifyCommandChanged();
      });
      // find next and previous are now enabled
      commands.notifyCommandChanged();
      searchInstance.focusInput();
    }
  });

  commands.addCommand(cmdIds.findNext, {
    label: 'Find Next',
    isEnabled: () => !!searchInstance,
    execute: async () => {
      if (!searchInstance) {
        return;
      }
      await searchInstance.provider.highlightNext();
      searchInstance.updateIndices();
    }
  });

  commands.addCommand(cmdIds.findPrevious, {
    label: 'Find Previous',
    isEnabled: () => !!searchInstance,
    execute: async () => {
      if (!searchInstance) {
        return;
      }
      await searchInstance.provider.highlightPrevious();
      searchInstance.updateIndices();
    }
  });

  commands.addCommand(cmdIds.interrupt, {
    label: 'Interrupt',
    execute: async () => nbWidget.context.sessionContext.session?.kernel?.interrupt()
  });

  commands.addCommand(cmdIds.restart, {
    label: 'Restart Kernel',
    execute: () => sessionContextDialogs.restart(nbWidget.context.sessionContext)
  });

  commands.addCommand(cmdIds.runAndAdvance, {
    label: 'Run and Advance',
    execute: () => {
      return NotebookActions.runAndAdvance(nbWidget.content, nbWidget.context.sessionContext);
    }
  });

  commands.addCommand(cmdIds.runAll, {
    label: 'Run all',
    execute: () => {
      return NotebookActions.runAll(nbWidget.content, nbWidget.context.sessionContext);
    }
  });

  commands.addCommand(cmdIds.run, {
    label: 'Run',
    execute: () => {
      return NotebookActions.run(nbWidget.content, nbWidget.context.sessionContext);
    }
  });

  commands.addCommand(cmdIds.editMode, {
    label: 'Edit Mode',
    execute: () => {
      nbWidget.content.mode = 'edit';
    }
  });

  commands.addCommand(cmdIds.commandMode, {
    label: 'Command Mode',
    execute: () => {
      nbWidget.content.mode = 'command';
    }
  });

  commands.addCommand(cmdIds.selectBelow, {
    label: 'Select Below',
    execute: () => NotebookActions.selectBelow(nbWidget.content)
  });

  commands.addCommand(cmdIds.selectAbove, {
    label: 'Select Above',
    execute: () => NotebookActions.selectAbove(nbWidget.content)
  });

  commands.addCommand(cmdIds.extendAbove, {
    label: 'Extend Above',
    execute: () => NotebookActions.extendSelectionAbove(nbWidget.content)
  });

  commands.addCommand(cmdIds.extendTop, {
    label: 'Extend to Top',
    execute: () => NotebookActions.extendSelectionAbove(nbWidget.content, true)
  });

  commands.addCommand(cmdIds.extendBelow, {
    label: 'Extend Below',
    execute: () => NotebookActions.extendSelectionBelow(nbWidget.content)
  });

  commands.addCommand(cmdIds.extendBottom, {
    label: 'Extend to Bottom',
    execute: () => NotebookActions.extendSelectionBelow(nbWidget.content, true)
  });

  commands.addCommand(cmdIds.merge, {
    label: 'Merge Cells',
    execute: () => NotebookActions.mergeCells(nbWidget.content)
  });

  commands.addCommand(cmdIds.split, {
    label: 'Split Cell',
    execute: () => NotebookActions.splitCell(nbWidget.content)
  });

  commands.addCommand(cmdIds.undo, {
    label: 'Undo',
    execute: () => NotebookActions.undo(nbWidget.content)
  });

  commands.addCommand(cmdIds.redo, {
    label: 'Redo',
    execute: () => NotebookActions.redo(nbWidget.content)
  });

  commands.addCommand(cmdIds.revert, {
    label: 'Reload changes',
    execute: async () => {
      // copy base across
      await serviceManager.contents.save(revertPath, revertContents);
      await nbWidget.context.revert();
    }
  });

  toolbar.addItem(
    'Restart python',
    new CommandToolbarButton({
      id: cmdIds.restart,
      commands: commands,
      icon: stopIcon,
      label: 'Restart Python'
    })
  );

  toolbar.addItem(
    'Run current code cell',
    new CommandToolbarButton({
      id: cmdIds.runAndAdvance,
      commands: commands,
      icon: runIcon,
      label: 'Run cell'
    })
  );

  toolbar.addItem(
    'Run all code cells',
    new CommandToolbarButton({
      id: cmdIds.runAll,
      commands: commands,
      icon: fastForwardIcon,
      label: 'Run all code'
    })
  );

  toolbar.addItem(
    'Reload original code',
    new CommandToolbarButton({
      id: cmdIds.revert,
      commands: commands,
      icon: refreshIcon,
      label: 'Reset to original code.'
    })
  );

  const bindings = [
    {
      selector: '.jp-Notebook.jp-mod-editMode .jp-mod-completer-enabled',
      keys: ['Tab'],
      command: cmdIds.invokeNotebook
    },
    {
      selector: `.jp-mod-completer-active`,
      keys: ['Enter'],
      command: cmdIds.selectNotebook
    },
    {
      selector: '.jp-Notebook',
      keys: ['Ctrl Enter'],
      command: cmdIds.run
    },
    {
      selector: '.jp-Notebook',
      keys: ['Shift Enter'],
      command: cmdIds.runAndAdvance
    },
    {
      selector: '.jp-Notebook',
      keys: ['Accel F'],
      command: cmdIds.startSearch
    },
    {
      selector: '.jp-Notebook',
      keys: ['Accel G'],
      command: cmdIds.findNext
    },
    {
      selector: '.jp-Notebook',
      keys: ['Accel Shift G'],
      command: cmdIds.findPrevious
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['I', 'I'],
      command: cmdIds.interrupt
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['0', '0'],
      command: cmdIds.restart
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Enter'],
      command: cmdIds.editMode
    },
    {
      selector: '.jp-Notebook.jp-mod-editMode',
      keys: ['Escape'],
      command: cmdIds.commandMode
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Shift M'],
      command: cmdIds.merge
    },
    {
      selector: '.jp-Notebook.jp-mod-editMode',
      keys: ['Ctrl Shift -'],
      command: cmdIds.split
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['J'],
      command: cmdIds.selectBelow
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['ArrowDown'],
      command: cmdIds.selectBelow
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['K'],
      command: cmdIds.selectAbove
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['ArrowUp'],
      command: cmdIds.selectAbove
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Shift K'],
      command: cmdIds.extendAbove
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Shift J'],
      command: cmdIds.extendBelow
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Z'],
      command: cmdIds.undo
    },
    {
      selector: '.jp-Notebook.jp-mod-commandMode:focus',
      keys: ['Y'],
      command: cmdIds.redo
    }
  ];

  bindings.map((binding) => commands.addKeyBinding(binding));
};

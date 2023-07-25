import React from 'react';
import { useTasksState, Task } from './TasksState';
import { State, useHookstate, suspend, none } from '@hookstate/core';
import { useSettingsState } from './SettingsState';

function TaskEditor(props: { task: State<Task> }) {
    
    const settingsState = useSettingsState()

    let taskState = useHookstate(props.task);
    if (!settingsState.isScopedUpdateEnabled) {
        taskState = props.task;
    }
    const taskNameGlobal = taskState.name;

    const taskNameLocal = useHookstate(taskState.name.get());

    const isEditing = useHookstate(false)

    var colors = ['#ff0000', '#00ff00', '#0000ff'];
    const color = React.useRef(0)
    color.current += 1
    var nextColor = colors[color.current % colors.length];
    
    return <div
        id={`task${taskState.id.get()}`}
        style={{
            display: 'flex',
            marginBottom: 10,
        }}
    >
        {settingsState.isHighlightUpdateEnabled &&
            <div
                style={{
                    width: 10,
                    marginRight: 15,
                    backgroundColor: nextColor
                }}
            />
        }
        <div
            style={{
                flexGrow: 2,
                display: 'flex',
                border: 'solid',
                borderWidth: settingsState.isEditableInline || isEditing.get() ? 1 : 0,
                borderColor: 'grey',
            }}
        >
            <div>
                <input
                    id={`taskCheckbox${taskState.id.get()}`}
                    style={{
                        transform: 'scale(2)',
                        margin: 20
                    }}
                    type="checkbox"
                    checked={taskState.done.get()}
                    onChange={() => taskState.done.set(p => !p)}
                />
            </div>
            <div style={{ flexGrow: 2 }}>
                <input
                    className={`taskInput${taskState.id.get()}`}
                    style={{
                        fontSize: '1em',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        width: '90%',
                        padding: 10,
                        textDecoration: taskState.done.get() ? 'line-through' : 'none',
                    }}
                    readOnly={!(settingsState.isEditableInline || isEditing.get())}
                    value={
                        settingsState.isEditableInline
                            ? taskNameGlobal.get()
                            : taskNameLocal.get()
                    }
                    onChange={e => {
                        if (settingsState.isEditableInline) {
                            taskNameGlobal.set(e.target.value)
                        }
                        taskNameLocal.set(e.target.value)
                    }}
                />
            </div>
        </div>
        {!settingsState.isEditableInline &&
            <div>{isEditing.get()
                ? <Button
                    style={{
                        marginLeft: 20
                    }}
                    borderColor="grey"
                    onClick={() => {
                        taskNameGlobal.set(taskNameLocal.get())
                        isEditing.set(false)
                    }}
                    text="Save"
                />
                : <Button
                    style={{
                        marginLeft: 20
                    }}
                    borderColor="grey"
                    onClick={() => isEditing.set(true)}
                    text="Edit"
                />
            }</div>
        }
        <div>{isEditing.get()
            ? <Button
                style={{ marginLeft: 15 }}
                borderColor="red"
                onClick={() => {
                    isEditing.set(false)
                    taskNameLocal.set(taskNameGlobal.get())
                }}
                text="Cancel"
            />
            : <Button
                style={{ marginLeft: 15 }}
                borderColor="red"
                onClick={() => {
                    isEditing.set(false)
                    taskState.set(none)
                }}
                text="Delete"
            />
        }</div>
    </div>
}

const TaskEditorMomorized = TaskEditor
// const TaskEditorMomorized = React.memo(TaskEditor)

export function TasksViewer() {
    const tasksState = useTasksState()
    

    
    return suspend(tasksState) || <div key="" style={{ textAlign: 'left', marginBottom: 50 }}>{
        tasksState.map((task, i) => <TaskEditorMomorized
            key={task.id.value}
            task={task}
        />)
    }
        <div id="buttonAddTask" style={{ textAlign: 'right' }} >
            <Button
                style={{ marginTop: 20, minWidth: 300 }}
                borderColor="lightgreen"
                onClick={() => {
                    let new_id = 1;
                    // eslint-disable-next-line no-loop-func
                    while (tasksState.findIndex(i => i.id.get() === new_id.toString()) !== -1) {
                        new_id += 1;
                    }
                    tasksState[tasksState.length].set({
                        id: new_id.toString(),
                        name: 'Untitled Task #' + (tasksState.length + 1),
                        done: false
                    })
                }}
                text="Add new task"
            />
        </div>
    </div>
}

function Button(props: {
    onClick?: () => void,
    borderColor?: string,
    text: string,
    style?: React.CSSProperties
}) {
    return <button
        style={{
            fontSize: '1em',
            border: 'solid',
            borderWidth: 1,
            borderColor: props.borderColor || 'grey',
            color: 'white',
            background: 'none',
            padding: 10,
            minWidth: 110,
            ...props.style
        }}
        onClick={() => props.onClick && props.onClick()}
    >{props.text}</button>
}

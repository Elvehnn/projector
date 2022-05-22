import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteColumn, deleteTask, getBoardById } from '../../api/api';
import { IBoard, IColumn, ITask } from '../../constants/interfaces';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { Header } from '../Header/Header';
import './board.scss';
import AddNewColumnForm from '../AddNewColumnForm/AddNewColumnForm';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import ConfirmPopUp from '../ConfirmPopUp/ConfirmPopUp';
import Column from '../Column/Column';
import getColumnsColor from '../getColumnsColor/getColumnsColor';
import { GlobalContext } from '../../provider/provider';
import AddNewBoardForm from '../AddNewBoardForm/AddNewBoardForm';
import Notification, { notify } from '../Notification/Notification';
import axios from 'axios';
import { Card, Typography, CardContent } from '@mui/material';
import { localizationContent } from '../../localization/types';
import AddNewTaskForm from '../AddNewTaskForm/AddNewTaskForm';
import EditTaskForm from '../EditTaskForm/EditTaskForm';
import Footer from '../Footer/Footer';

export const Board = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>().id || '';
  const [board, setBoard] = useState<IBoard | null>(null);
  const [isAddColumnFormOpen, setIsAddColumnFormOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<IColumn | null>(null);
  const [isShowConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [columnToAddTask, setColumnToAddTask] = useState<IColumn | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const { isCreateNewBoardOpen } = useContext(GlobalContext);

  useEffect(() => {
    getBoardById(params).then(
      (response) => {
        if (response) {
          setBoard(response);
        }
      },
      (error) => {
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();

        notify(resMessage);
      }
    );
  }, [params]);

  const handleDeleteColumn = async (columnToDelete: IColumn) => {
    if (!board) return;
    try {
      await deleteColumn(board.id, columnToDelete.id);

      const newBoard = await getBoardById(params);

      setBoard(newBoard);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const resMessage = error.message || error.toString();
        notify(resMessage);
      }
    } finally {
      setShowConfirmPopUp(false);
      setColumnToDelete(null);
    }
  };

  const handleDeleteTask = async (task: ITask) => {
    if (!board) return;

    try {
      await deleteTask(task);

      const newBoard = await getBoardById(params);

      setBoard(newBoard);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const resMessage = error.message || error.toString();
        notify(resMessage);
      }
    } finally {
      setShowConfirmPopUp(false);
      setTaskToDelete(null);
    }
  };

  board?.columns.sort((a, b) => (a.order > b.order ? 1 : -1));
  const colors = getColumnsColor(board);

  const columns = board?.columns.map((column) => {
    return (
      <Column
        key={column.id}
        board={board}
        setBoard={setBoard}
        column={column}
        color={colors.get(column.id) || '#87A8EC'}
        setColumnToDelete={setColumnToDelete}
        setShowConfirmPopUp={setShowConfirmPopUp}
        setColumnToAddTask={setColumnToAddTask}
        setTaskToEdit={setTaskToEdit}
        setTaskToDelete={setTaskToDelete}
      />
    );
  });

  return (
    <>
      <Header />

      <div className="board">
        <Button
          sx={{ position: 'absolute', top: '71px', left: '10px' }}
          onClick={() => navigate(-1)}
        >
          <KeyboardBackspaceIcon sx={{ fontSize: '66px' }} />
        </Button>{' '}
        <h3>Board «{board?.title}»</h3>
        <Card sx={{ minWidth: 0.8 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              Board Description
            </Typography>
            <Typography sx={{ fontSize: 18 }} variant="body2" color="text.primary">
              {board?.description}
            </Typography>
          </CardContent>
        </Card>{' '}
        <div className="columns-container">
          {columns}
          <Button
            variant="outlined"
            className="button-add-item"
            startIcon={<AddIcon />}
            onClick={() => setIsAddColumnFormOpen(true)}
          >
            {localizationContent.buttons.addColumn}
          </Button>
        </div>
      </div>

      <Footer />

      {isAddColumnFormOpen && board && (
        <AddNewColumnForm
          setIsAddColumnFormOpen={setIsAddColumnFormOpen}
          board={board}
          setBoard={setBoard}
        />
      )}

      {columnToDelete && (
        <ConfirmPopUp
          description={`${localizationContent.deleteColumn.description} "${columnToDelete.title}"?`}
          isOpen={isShowConfirmPopUp}
          toShowPopUp={setShowConfirmPopUp}
          onConfirm={() => {
            handleDeleteColumn(columnToDelete);
          }}
          onCancel={() => {
            setShowConfirmPopUp(false);
            setColumnToDelete(null);
          }}
        />
      )}

      {isCreateNewBoardOpen && <AddNewBoardForm />}

      {columnToAddTask && board && (
        <AddNewTaskForm
          setColumnToAddTask={setColumnToAddTask}
          setBoard={setBoard}
          boardId={board.id}
          column={columnToAddTask}
        />
      )}

      {taskToEdit && board && (
        <EditTaskForm
          task={taskToEdit}
          setTaskToEdit={setTaskToEdit}
          setBoard={setBoard}
          boardId={board.id}
        />
      )}

      {taskToDelete && (
        <ConfirmPopUp
          description={`${localizationContent.deleteTask.description} "${taskToDelete.title}"?`}
          isOpen={isShowConfirmPopUp}
          toShowPopUp={setShowConfirmPopUp}
          onConfirm={() => {
            handleDeleteTask(taskToDelete);
          }}
          onCancel={() => {
            setShowConfirmPopUp(false);
            setTaskToDelete(null);
          }}
        />
      )}

      <Notification />
    </>
  );
};
